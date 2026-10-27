const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  getExamAnalytics,
  getStudentAnalytics,
  getAdminOverview,
} = require('../controllers/analyticsController');

router.use(protect);

router.get('/exam/:examId', authorize('faculty', 'admin'), getExamAnalytics);
router.get('/student/:studentId?', getStudentAnalytics);
router.get('/admin/overview', authorize('admin'), getAdminOverview);

module.exports = router;
