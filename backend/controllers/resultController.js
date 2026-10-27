const Attempt = require('../models/Attempt');
const Notification = require('../models/Notification');

// @route PATCH /api/results/:examId/publish  - faculty publishes all evaluated results for an exam
const publishResults = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ exam: req.params.examId, status: { $in: ['evaluated', 'submitted', 'auto_submitted'] } });
    if (!attempts.length) {
      return res.status(400).json({ success: false, message: 'No attempts found to publish for this exam' });
    }

    await Attempt.updateMany(
      { exam: req.params.examId },
      { resultPublished: true, status: 'evaluated' }
    );

    await Notification.insertMany(
      attempts.map((a) => ({
        recipient: a.student,
        title: 'Result published',
        message: 'Your exam result has been published. Check your dashboard for details.',
        type: 'result_published',
        relatedExam: req.params.examId,
      }))
    );

    res.json({ success: true, message: `${attempts.length} result(s) published` });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/results/my  - student result history
const getMyResults = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({
      student: req.user._id,
      status: { $in: ['submitted', 'auto_submitted', 'evaluated'] },
    })
      .populate('exam', 'title subject totalMarks passingMarks startTime duration')
      .sort({ submittedAt: -1, createdAt: -1 });

    res.json({ success: true, count: attempts.length, results: attempts });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/results/:attemptId/detail  - detailed breakdown
const getResultDetail = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId)
      .populate('exam')
      .populate({ path: 'answers.question', model: 'Question' });

    if (!attempt) return res.status(404).json({ success: false, message: 'Result not found' });

    const isOwner = String(attempt.student) === String(req.user._id);
    const isFacultyOrAdmin = ['faculty', 'admin'].includes(req.user.role);

    if (!isOwner && !isFacultyOrAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, attempt });
  } catch (err) {
    next(err);
  }
};

module.exports = { publishResults, getMyResults, getResultDetail };
