const express = require('express');
const router = express.Router();
const { getReminders, addReminder, updateReminder, deleteReminder } = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getReminders);
router.post('/', protect, addReminder);
router.put('/:id', protect, updateReminder);
router.delete('/:id', protect, deleteReminder);

module.exports = router;
