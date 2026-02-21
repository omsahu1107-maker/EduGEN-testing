const express = require('express');
const router = express.Router();
const { getSlots, addSlot, updateSlot, deleteSlot } = require('../controllers/timetableController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSlots);
router.post('/', protect, addSlot);
router.put('/:id', protect, updateSlot);
router.delete('/:id', protect, deleteSlot);

module.exports = router;
