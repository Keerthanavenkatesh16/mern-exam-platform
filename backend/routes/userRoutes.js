const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  setUserStatus,
  deleteUser,
} = require('../controllers/userController');

router.use(protect);

router.get('/', authorize('admin'), getUsers);
router.post('/', authorize('admin'), createUser);
router.get('/:id', authorize('admin', 'faculty'), getUserById);
router.put('/:id', authorize('admin'), updateUser);
router.patch('/:id/status', authorize('admin'), setUserStatus);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
