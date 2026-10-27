const Question = require('../models/Question');

const createQuestion = async (req, res, next) => {
  try {
    const question = await Question.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, question });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/questions?subject=&topic=&difficulty=&type=&search=&questionBank=
const getQuestions = async (req, res, next) => {
  try {
    const { subject, topic, difficulty, type, search, questionBank, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;
    if (questionBank) filter.questionBank = questionBank;
    if (search) filter.questionText = { $regex: search, $options: 'i' };
    if (req.user.role === 'faculty') filter.createdBy = req.user._id;

    const questions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Question.countDocuments(filter);

    res.json({ success: true, count: questions.length, total, page: Number(page), questions });
  } catch (err) {
    next(err);
  }
};

const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, question });
  } catch (err) {
    next(err);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, question });
  } catch (err) {
    next(err);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, message: 'Question deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createQuestion, getQuestions, getQuestionById, updateQuestion, deleteQuestion };
