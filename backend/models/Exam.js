const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: String, required: true },
    course: { type: String },
    department: { type: String },

    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    totalMarks: { type: Number, required: true },
    passingMarks: { type: Number, required: true },
    duration: { type: Number, required: true }, // minutes

    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

    negativeMarking: { type: Boolean, default: false },
    randomizeQuestions: { type: Boolean, default: false },
    randomizeOptions: { type: Boolean, default: false },

    instructions: { type: String },

    proctoring: {
      requireCamera: { type: Boolean, default: false },
      requireFullscreen: { type: Boolean, default: false },
      trackTabSwitch: { type: Boolean, default: true },
      maxTabSwitchWarnings: { type: Number, default: 3 },
    },

    status: {
      type: String,
      enum: ['draft', 'scheduled', 'active', 'completed', 'published', 'archived'],
      default: 'draft',
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    allowedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // empty = open to course/dept
  },
  { timestamps: true }
);

examSchema.virtual('questionCount').get(function () {
  return this.questions ? this.questions.length : 0;
});
examSchema.set('toJSON', { virtuals: true });
examSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Exam', examSchema);
