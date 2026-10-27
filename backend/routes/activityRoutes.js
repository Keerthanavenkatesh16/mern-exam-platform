const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { getSuspiciousActivity, getAttemptActivityLog } = require('../controllers/activityController');

router.use(protect);
router.use(authorize('faculty', 'admin'));

router.get('/suspicious', getSuspiciousActivity);
router.get('/:attemptId/log', getAttemptActivityLog);

module.exports = router;
