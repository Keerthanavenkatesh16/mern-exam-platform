const Attempt = require('../models/Attempt');

// @route GET /api/activity/suspicious?examId=
const getSuspiciousActivity = async (req, res, next) => {
  try {
    const { examId } = req.query;
    const filter = { flaggedSuspicious: true };
    if (examId) filter.exam = examId;

    const attempts = await Attempt.find(filter)
      .populate('exam', 'title subject')
      .populate('student', 'name email rollNumber')
      .select('exam student tabSwitchCount fullscreenExitCount activityLog status')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: attempts.length, attempts });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/activity/:attemptId/log  - full activity/proctoring log for one attempt
const getAttemptActivityLog = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId)
      .populate('exam', 'title')
      .populate('student', 'name email');
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });

    res.json({
      success: true,
      student: attempt.student,
      exam: attempt.exam,
      tabSwitchCount: attempt.tabSwitchCount,
      fullscreenExitCount: attempt.fullscreenExitCount,
      flaggedSuspicious: attempt.flaggedSuspicious,
      activityLog: attempt.activityLog,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSuspiciousActivity, getAttemptActivityLog };
