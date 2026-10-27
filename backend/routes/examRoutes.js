const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  updateExamStatus,
} = require('../controllers/examController');

router.use(protect);

router.post('/', authorize('admin', 'faculty'), createExam);
router.get('/', getExams); // all roles, scoped inside controller
router.get('/:id', getExamById);
router.put('/:id', authorize('admin', 'faculty'), updateExam);
router.delete('/:id', authorize('admin', 'faculty'), deleteExam);
router.patch('/:id/status', authorize('admin', 'faculty'), updateExamStatus);

module.exports = router;
