const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedOptionIds: [{ type: String }], // for mcq/multi_select/true_false
    textAnswer: { type: String }, // fill_blank / short_answer / descriptive
    code: { type: String }, // coding
    language: { type: String },
    markedForReview: { type: Boolean, default: false },
    visited: { type: Boolean, default: false },
    timeSpentSeconds: { type: Number, default: 0 },

    // evaluation
    isCorrect: { type: Boolean, default: null },
    marksAwarded: { type: Number, default: 0 },
    needsManualReview: { type: Boolean, default: false },
    testCaseResults: [
      {
        passed: Boolean,
        actualOutput: String,
      },
    ],
  },
  { _id: false }
);

const activityEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'tab_switch',
        'fullscreen_exit',
        'fullscreen_enter',
        'copy_paste',
        'right_click',
        'window_blur',
        'window_focus',
        'multiple_login',
        'camera_error',
        'camera_disabled',
        'other',
      ],
    },
    timestamp: { type: Date, default: Date.now },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'auto_submitted', 'evaluated'],
      default: 'in_progress',
    },

    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    lastSavedAt: { type: Date, default: Date.now },

    answers: [answerSchema],
    activityLog: [activityEventSchema],
    tabSwitchCount: { type: Number, default: 0 },
    fullscreenExitCount: { type: Number, default: 0 },
    flaggedSuspicious: { type: Boolean, default: false },

    totalMarksAwarded: { type: Number, default: 0 },
    totalMarksPossible: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    resultPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

attemptSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Attempt', attemptSchema);
