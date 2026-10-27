const Notification = require('../models/Notification');
const User = require('../models/User');

// @route GET /api/notifications  - current user's notifications
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, notification });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/notifications/announce  (admin/faculty broadcast)
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, role, course } = req.body;
    const filter = {};
    if (role) filter.role = role;
    if (course) filter.course = course;

    const recipients = await User.find(filter).select('_id');
    await Notification.insertMany(
      recipients.map((r) => ({ recipient: r._id, title, message, type: 'announcement' }))
    );

    res.status(201).json({ success: true, message: `Announcement sent to ${recipients.length} user(s)` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, createAnnouncement };
