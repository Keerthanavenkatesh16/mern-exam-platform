const QuestionBank = require('../models/QuestionBank');
const Question = require('../models/Question');

const createBank = async (req, res, next) => {
  try {
    const { name, subject, description } = req.body;
    const bank = await QuestionBank.create({ name, subject, description, createdBy: req.user._id });
    res.status(201).json({ success: true, bank });
  } catch (err) {
    next(err);
  }
};

const getBanks = async (req, res, next) => {
  try {
    const { subject } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    // faculty see their own banks; admin sees all
    if (req.user.role === 'faculty') filter.createdBy = req.user._id;

    const banks = await QuestionBank.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: banks.length, banks });
  } catch (err) {
    next(err);
  }
};

const getBankById = async (req, res, next) => {
  try {
    const bank = await QuestionBank.findById(req.params.id);
    if (!bank) return res.status(404).json({ success: false, message: 'Question bank not found' });
    const questions = await Question.find({ questionBank: bank._id });
    res.json({ success: true, bank, questions });
  } catch (err) {
    next(err);
  }
};

const updateBank = async (req, res, next) => {
  try {
    const bank = await QuestionBank.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!bank) return res.status(404).json({ success: false, message: 'Question bank not found' });
    res.json({ success: true, bank });
  } catch (err) {
    next(err);
  }
};

const deleteBank = async (req, res, next) => {
  try {
    const bank = await QuestionBank.findByIdAndDelete(req.params.id);
    if (!bank) return res.status(404).json({ success: false, message: 'Question bank not found' });
    await Question.deleteMany({ questionBank: bank._id });
    res.json({ success: true, message: 'Question bank and its questions deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBank, getBanks, getBankById, updateBank, deleteBank };
