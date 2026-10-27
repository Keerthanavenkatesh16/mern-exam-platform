const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  createBank,
  getBanks,
  getBankById,
  updateBank,
  deleteBank,
} = require('../controllers/questionBankController');

router.use(protect);

router.post('/', authorize('admin', 'faculty'), createBank);
router.get('/', authorize('admin', 'faculty'), getBanks);
router.get('/:id', authorize('admin', 'faculty'), getBankById);
router.put('/:id', authorize('admin', 'faculty'), updateBank);
router.delete('/:id', authorize('admin', 'faculty'), deleteBank);

module.exports = router;
