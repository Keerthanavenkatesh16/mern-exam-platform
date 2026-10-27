const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  createAnnouncement,
} = require('../controllers/notificationController');

router.use(protect);

router.get('/', getMyNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.post('/announce', authorize('admin', 'faculty'), createAnnouncement);

module.exports = router;
