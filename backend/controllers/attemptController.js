const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const { evaluateObjectiveAnswer, runCodeTestCases } = require('../utils/evaluateAnswer');

// @route POST /api/attempts/start/:examId
const startAttempt = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.examId).populate('questions');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const now = new Date();
    if (now < exam.startTime) {
      return res.status(400).json({ success: false, message: 'Exam has not started yet' });
    }
    if (now > exam.endTime) {
      return res.status(400).json({ success: false, message: 'Exam window has closed' });
    }
    if (!['scheduled', 'active'].includes(exam.status)) {
      return res.status(400).json({ success: false, message: 'Exam is not currently open for attempts' });
    }

    let attempt = await Attempt.findOne({ exam: exam._id, student: req.user._id });
    if (attempt) {
      if (attempt.status !== 'in_progress') {
        return res.status(400).json({ success: false, message: 'You have already submitted this exam' });
      }
      return res.json({ success: true, attempt, exam: sanitizeExamForStudent(exam), resumed: true });
    }

    let questions = exam.questions;
    if (exam.randomizeQuestions) {
      questions = [...questions].sort(() => Math.random() - 0.5);
    }

    try {
      attempt = await Attempt.create({
        exam: exam._id,
        student: req.user._id,
        answers: questions.map((q) => ({ question: q._id, visited: false })),
        totalMarksPossible: exam.totalMarks,
      });
    } catch (createErr) {
      if (createErr.code === 11000) {
        attempt = await Attempt.findOne({ exam: exam._id, student: req.user._id });
        if (attempt) {
          if (attempt.status !== 'in_progress') {
            return res.status(400).json({ success: false, message: 'You have already submitted this exam' });
          }
          return res.json({ success: true, attempt, exam: sanitizeExamForStudent(exam), resumed: true });
        }
      }
      throw createErr;
    }

    if (exam.status === 'scheduled') {
      exam.status = 'active';
      await exam.save();
    }

    res.status(201).json({ success: true, attempt, exam: sanitizeExamForStudent(exam), resumed: false });
  } catch (err) {
    next(err);
  }
};

function sanitizeExamForStudent(exam) {
  const obj = exam.toObject();
  obj.questions = (obj.questions || []).map((q) => {
    const { correctAnswerText, testCases, createdBy, ...rest } = q;
    return {
      ...rest,
      options: (q.options || []).map((o) => ({ _id: o._id, text: o.text })), // strip isCorrect
      testCases: (q.testCases || []).filter((tc) => !tc.isHidden).map((tc) => ({ input: tc.input })),
    };
  });
  return obj;
}

// @route PUT /api/attempts/:id/answer  - autosave a single answer
const saveAnswer = async (req, res, next) => {
  try {
    const { questionId, selectedOptionIds, textAnswer, code, language, markedForReview, timeSpentSeconds } = req.body;

    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
    if (String(attempt.student) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not your exam attempt' });
    }
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Attempt is no longer in progress' });
    }

    const answerIdx = attempt.answers.findIndex((a) => String(a.question) === String(questionId));
    if (answerIdx === -1) {
      return res.status(404).json({ success: false, message: 'Question not part of this attempt' });
    }

    const answer = attempt.answers[answerIdx];
    if (selectedOptionIds !== undefined) answer.selectedOptionIds = selectedOptionIds;
    if (textAnswer !== undefined) answer.textAnswer = textAnswer;
    if (code !== undefined) answer.code = code;
    if (language !== undefined) answer.language = language;
    if (markedForReview !== undefined) answer.markedForReview = markedForReview;
    if (timeSpentSeconds !== undefined) answer.timeSpentSeconds += timeSpentSeconds;
    answer.visited = true;

    attempt.lastSavedAt = new Date();
    await attempt.save();

    res.json({ success: true, message: 'Answer saved', lastSavedAt: attempt.lastSavedAt });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/attempts/:id/activity - log proctoring / integrity events
const logActivity = async (req, res, next) => {
  try {
    const { type, meta } = req.body;
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
    if (String(attempt.student) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not your exam attempt' });
    }

    attempt.activityLog.push({ type, meta, timestamp: new Date() });
    if (type === 'tab_switch' || type === 'window_blur') attempt.tabSwitchCount += 1;
    if (type === 'fullscreen_exit') attempt.fullscreenExitCount += 1;

    const exam = await Exam.findById(attempt.exam);
    const threshold = exam?.proctoring?.maxTabSwitchWarnings ?? 3;
    if (attempt.tabSwitchCount > threshold || attempt.fullscreenExitCount > threshold) {
      attempt.flaggedSuspicious = true;
    }

    await attempt.save();
    res.json({ success: true, flagged: attempt.flaggedSuspicious });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/attempts/:id/submit
const submitAttempt = async (req, res, next) => {
  try {
    const { autoSubmitted = false } = req.body;
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
    if (String(attempt.student) !== String(req.user._id) && req.user.role === 'student') {
      return res.status(403).json({ success: false, message: 'Not your exam attempt' });
    }
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Attempt already submitted' });
    }

    const result = await evaluateAttempt(attempt);
    result.status = autoSubmitted ? 'auto_submitted' : 'submitted';
    result.submittedAt = new Date();
    if (!result.answers.some((a) => a.needsManualReview)) {
      result.resultPublished = true;
      result.status = 'evaluated';
    }
    await result.save();

    res.json({ success: true, attempt: result });
  } catch (err) {
    next(err);
  }
};

// Core evaluation: runs through every answer, grades objective/coding types automatically,
// flags descriptive answers for manual faculty review, and aggregates totals.
async function evaluateAttempt(attempt) {
  const questionIds = attempt.answers.map((a) => a.question);
  const questions = await Question.find({ _id: { $in: questionIds } });
  const qMap = new Map(questions.map((q) => [String(q._id), q]));

  let totalAwarded = 0;
  let totalPossible = 0;
  let hasManualPending = false;

  for (const answer of attempt.answers) {
    const question = qMap.get(String(answer.question));
    if (!question) continue;
    totalPossible += question.marks;

    if (question.type === 'coding') {
      const codeResult = await runCodeTestCases(question, answer);
      answer.testCaseResults = codeResult.results;
      answer.marksAwarded = codeResult.marksAwarded;
      answer.needsManualReview = codeResult.needsManualReview;
      answer.isCorrect = codeResult.passedCount === codeResult.total && codeResult.total > 0;
    } else {
      const evalResult = evaluateObjectiveAnswer(question, answer);
      answer.isCorrect = evalResult.isCorrect;
      answer.marksAwarded = evalResult.marksAwarded;
      answer.needsManualReview = evalResult.needsManualReview;
    }

    if (answer.needsManualReview) hasManualPending = true;
    totalAwarded += answer.marksAwarded;
  }

  attempt.totalMarksAwarded = Math.max(0, totalAwarded);
  attempt.totalMarksPossible = totalPossible;
  attempt.percentage = totalPossible > 0 ? Number(((Math.max(0, totalAwarded) / totalPossible) * 100).toFixed(2)) : 0;

  const exam = await Exam.findById(attempt.exam);
  const passingPercentage = exam ? (exam.passingMarks / exam.totalMarks) * 100 : 0;
  attempt.passed = attempt.percentage >= passingPercentage;
  attempt.status = hasManualPending ? 'submitted' : 'evaluated';

  return attempt;
}

// @route PUT /api/attempts/:id/grade  - faculty manually grades descriptive answers
const gradeDescriptiveAnswer = async (req, res, next) => {
  try {
    const { questionId, marksAwarded, feedback } = req.body;
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });

    const answer = attempt.answers.find((a) => String(a.question) === String(questionId));
    if (!answer) return res.status(404).json({ success: false, message: 'Question not found in attempt' });

    const question = await Question.findById(questionId);
    const capped = Math.max(0, Math.min(Number(marksAwarded), question.marks));

    attempt.totalMarksAwarded = attempt.totalMarksAwarded - answer.marksAwarded + capped;
    answer.marksAwarded = capped;
    answer.needsManualReview = false;
    answer.isCorrect = capped === question.marks;
    if (feedback) answer.feedback = feedback;

    attempt.percentage =
      attempt.totalMarksPossible > 0
        ? Number(((attempt.totalMarksAwarded / attempt.totalMarksPossible) * 100).toFixed(2))
        : 0;

    const stillPending = attempt.answers.some((a) => a.needsManualReview);
    if (!stillPending) attempt.status = 'evaluated';

    const exam = await Exam.findById(attempt.exam);
    const passingPercentage = exam ? (exam.passingMarks / exam.totalMarks) * 100 : 0;
    attempt.passed = attempt.percentage >= passingPercentage;

    await attempt.save();
    const populated = await Attempt.findById(attempt._id)
      .populate('exam')
      .populate('student', 'name email rollNumber')
      .populate('answers.question');
    res.json({ success: true, attempt: populated });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/attempts/:id
const getAttemptById = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('exam')
      .populate('student', 'name email rollNumber')
      .populate('answers.question');
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });

    const isOwner = String(attempt.student._id) === String(req.user._id);
    const isFacultyOrAdmin = ['faculty', 'admin'].includes(req.user.role);
    if (!isOwner && !isFacultyOrAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this attempt' });
    }
    if (isOwner && !attempt.resultPublished && attempt.status !== 'in_progress') {
      // students can see submission confirmation, but detailed marks only after publication
      return res.json({
        success: true,
        attempt: {
          _id: attempt._id,
          status: attempt.status,
          submittedAt: attempt.submittedAt,
          resultPublished: false,
        },
      });
    }

    res.json({ success: true, attempt });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/attempts/exam/:examId  - faculty view of all attempts for an exam
const getAttemptsByExam = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ exam: req.params.examId })
      .populate('student', 'name email rollNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: attempts.length, attempts });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  startAttempt,
  saveAnswer,
  logActivity,
  submitAttempt,
  gradeDescriptiveAnswer,
  getAttemptById,
  getAttemptsByExam,
};
