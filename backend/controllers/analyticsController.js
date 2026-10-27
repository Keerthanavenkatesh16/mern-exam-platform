const mongoose = require('mongoose');
const Attempt = require('../models/Attempt');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const User = require('../models/User');

// @route GET /api/analytics/exam/:examId  - faculty/admin exam-level analytics
const getExamAnalytics = async (req, res, next) => {
  try {
    const examId = new mongoose.Types.ObjectId(req.params.examId);
    const attempts = await Attempt.find({ exam: examId, status: { $in: ['evaluated', 'submitted'] } });

    if (!attempts.length) {
      return res.json({
        success: true,
        analytics: {
          totalAttempts: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          passCount: 0,
          failCount: 0,
          passPercentage: 0,
        },
      });
    }

    const scores = attempts.map((a) => a.percentage);
    const passCount = attempts.filter((a) => a.passed).length;

    const analytics = {
      totalAttempts: attempts.length,
      averageScore: Number((scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(2)),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      passCount,
      failCount: attempts.length - passCount,
      passPercentage: Number(((passCount / attempts.length) * 100).toFixed(2)),
    };

    // question-wise analysis
    const exam = await Exam.findById(examId).populate('questions');
    const questionStats = [];
    for (const q of exam.questions) {
      let correct = 0,
        incorrect = 0,
        unanswered = 0;
      for (const a of attempts) {
        const ans = a.answers.find((x) => String(x.question) === String(q._id));
        if (!ans || (!ans.textAnswer && !ans.code && (!ans.selectedOptionIds || ans.selectedOptionIds.length === 0))) {
          unanswered++;
        } else if (ans.isCorrect) {
          correct++;
        } else {
          incorrect++;
        }
      }
      questionStats.push({
        question: q._id,
        questionText: q.questionText,
        difficulty: q.difficulty,
        correct,
        incorrect,
        unanswered,
      });
    }

    res.json({ success: true, analytics, questionStats });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/analytics/student/:studentId  - student's cross-exam performance
const getStudentAnalytics = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.user._id;
    if (String(studentId) !== String(req.user._id) && !['faculty', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const attempts = await Attempt.find({ student: studentId, resultPublished: true })
      .populate('exam', 'title subject startTime')
      .sort({ submittedAt: 1 });

    const subjectMap = {};
    attempts.forEach((a) => {
      const subj = a.exam?.subject || 'Unknown';
      if (!subjectMap[subj]) subjectMap[subj] = { subject: subj, scores: [] };
      subjectMap[subj].scores.push(a.percentage);
    });

    const subjectWise = Object.values(subjectMap).map((s) => ({
      subject: s.subject,
      averagePercentage: Number((s.scores.reduce((x, y) => x + y, 0) / s.scores.length).toFixed(2)),
      attemptCount: s.scores.length,
    }));

    const trend = attempts.map((a) => ({
      exam: a.exam?.title,
      date: a.exam?.startTime,
      percentage: a.percentage,
      passed: a.passed,
    }));

    res.json({
      success: true,
      totalExamsTaken: attempts.length,
      subjectWise,
      trend,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/analytics/admin/overview  - platform-wide dashboard stats
const getAdminOverview = async (req, res, next) => {
  try {
    const [totalUsers, totalStudents, totalFaculty, totalExams, activeExams, completedExams, upcomingExams, flaggedAttempts] =
      await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'faculty' }),
        Exam.countDocuments({}),
        Exam.countDocuments({ status: 'active' }),
        Exam.countDocuments({ status: { $in: ['completed', 'published'] } }),
        Exam.countDocuments({ status: 'scheduled' }),
        Attempt.countDocuments({ flaggedSuspicious: true }),
      ]);

    res.json({
      success: true,
      overview: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalExams,
        activeExams,
        completedExams,
        upcomingExams,
        flaggedAttempts,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getExamAnalytics, getStudentAnalytics, getAdminOverview };
