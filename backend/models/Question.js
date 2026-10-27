const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: true }
);

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, default: '' },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'mcq',
        'multi_select',
        'true_false',
        'fill_blank',
        'short_answer',
        'descriptive',
        'coding',
      ],
      required: true,
    },
    options: [optionSchema], // used for mcq / multi_select / true_false
    correctAnswerText: [{ type: String }], // used for fill_blank / short_answer (accepted answers)
    marks: { type: Number, required: true, default: 1 },
    negativeMarks: { type: Number, default: 0 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    subject: { type: String, required: true },
    topic: { type: String },
    tags: [{ type: String }],
    explanation: { type: String },
    // coding-specific fields
    starterCode: { type: String },
    allowedLanguages: [{ type: String }],
    testCases: [testCaseSchema],
    timeLimitSeconds: { type: Number, default: 2 },
    questionBank: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

questionSchema.index({ subject: 1, topic: 1, difficulty: 1, type: 1 });

module.exports = mongoose.model('Question', questionSchema);
