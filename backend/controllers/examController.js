const Exam = require('../models/Exam');
const Notification = require('../models/Notification');
const User = require('../models/User');

const createExam = async (req, res, next) => {
  try {
    const exam = await Exam.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, exam });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/exams  - listing scoped by role
const getExams = async (req, res, next) => {
  try {
    const { status, subject, course, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    if (course) filter.course = course;

    if (req.user.role === 'faculty') {
      filter.createdBy = req.user._id;
      if (status) filter.status = status;
    } else if (req.user.role === 'student') {
      // students only see published/scheduled/active exams relevant to them
      filter.status = { $in: ['scheduled', 'active', 'completed', 'published'] };
      filter.$or = [
        { allowedStudents: { $size: 0 } },
        { allowedStudents: req.user._id },
      ];
      if (req.user.course) {
        filter.$and = [{ $or: [{ course: req.user.course }, { course: { $exists: false } }, { course: '' }] }];
      }
    } else if (status) {
      filter.status = status; // admin can filter freely
    }

    const exams = await Exam.find(filter)
      .populate('createdBy', 'name email')
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Exam.countDocuments(filter);

    res.json({ success: true, count: exams.length, total, page: Number(page), exams });
  } catch (err) {
    next(err);
  }
};

const getExamById = async (req, res, next) => {
  try {
    const populateQuestions = req.user.role !== 'student';
    let query = Exam.findById(req.params.id);
    if (populateQuestions) query = query.populate('questions');
    const exam = await query;
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, exam });
  } catch (err) {
    next(err);
  }
};

const updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, exam });
  } catch (err) {
    next(err);
  }
};

const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, message: 'Exam deleted' });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/exams/:id/status  { status: 'scheduled' | 'active' | 'completed' | 'published' | 'archived' }
const updateExamStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['draft', 'scheduled', 'active', 'completed', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const exam = await Exam.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    // notify relevant students on publish events
    if (status === 'scheduled' || status === 'published') {
      const filter = exam.allowedStudents?.length
        ? { _id: { $in: exam.allowedStudents } }
        : { role: 'student', ...(exam.course ? { course: exam.course } : {}) };
      const students = await User.find(filter).select('_id');

      const notifType = status === 'scheduled' ? 'exam_scheduled' : 'result_published';
      const title = status === 'scheduled' ? `New exam scheduled: ${exam.title}` : `Results published: ${exam.title}`;
      const message =
        status === 'scheduled'
          ? `${exam.title} is scheduled on ${new Date(exam.startTime).toLocaleString()}.`
          : `Your results for ${exam.title} have been published.`;

      if (students.length) {
        await Notification.insertMany(
          students.map((s) => ({
            recipient: s._id,
            title,
            message,
            type: notifType,
            relatedExam: exam._id,
          }))
        );
      }
    }

    res.json({ success: true, exam });
  } catch (err) {
    next(err);
  }
};

module.exports = { createExam, getExams, getExamById, updateExam, deleteExam, updateExamStatus };
