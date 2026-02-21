const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, addXP, getLeaderboard, getDashboardStats } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/update', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/add-xp', protect, addXP);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/dashboard', protect, getDashboardStats);

module.exports = router;
