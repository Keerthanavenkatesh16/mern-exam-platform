const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/questionController');

router.use(protect);

router.post('/', authorize('admin', 'faculty'), createQuestion);
router.get('/', authorize('admin', 'faculty'), getQuestions);
router.get('/:id', authorize('admin', 'faculty'), getQuestionById);
router.put('/:id', authorize('admin', 'faculty'), updateQuestion);
router.delete('/:id', authorize('admin', 'faculty'), deleteQuestion);

module.exports = router;
