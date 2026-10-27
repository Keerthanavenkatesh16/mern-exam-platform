const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['exam_scheduled', 'exam_reminder', 'exam_published', 'result_published', 'announcement'],
      default: 'announcement',
    },
    relatedExam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
