const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  startAttempt,
  saveAnswer,
  logActivity,
  submitAttempt,
  gradeDescriptiveAnswer,
  getAttemptById,
  getAttemptsByExam,
} = require('../controllers/attemptController');
const { getMyResults } = require('../controllers/resultController');

router.use(protect);

router.post('/start/:examId', authorize('student'), startAttempt);
router.put('/:id/answer', authorize('student'), saveAnswer);
router.post('/:id/activity', authorize('student'), logActivity);
router.post('/:id/submit', authorize('student', 'admin'), submitAttempt);
router.put('/:id/grade', authorize('faculty', 'admin'), gradeDescriptiveAnswer);
router.get('/exam/:examId', authorize('faculty', 'admin'), getAttemptsByExam);
router.get('/results', authorize('student'), getMyResults);
router.get('/:id', getAttemptById);

module.exports = router;
