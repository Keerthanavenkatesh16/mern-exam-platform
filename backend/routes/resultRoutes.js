const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { publishResults, getMyResults, getResultDetail } = require('../controllers/resultController');

router.use(protect);

router.patch('/:examId/publish', authorize('faculty', 'admin'), publishResults);
router.get('/my', authorize('student'), getMyResults);
router.get('/', authorize('student'), getMyResults);
router.get('/:attemptId', getResultDetail);
router.get('/:attemptId/detail', getResultDetail);

module.exports = router;
