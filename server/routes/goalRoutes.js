const express = require('express');
const router = express.Router();
const { getGoals, addGoal, updateGoal, completeGoal, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getGoals);
router.post('/', protect, addGoal);
router.put('/:id', protect, updateGoal);
router.put('/:id/complete', protect, completeGoal);
router.delete('/:id', protect, deleteGoal);

module.exports = router;
