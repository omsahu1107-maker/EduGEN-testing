const User = require('../models/User');
const QuizResult = require('../models/QuizResult');

// @desc Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, avatar, theme, language } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, avatar, theme, language },
            { new: true, runValidators: true }
        ).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc Change password
exports.changePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(400).json({ success: false, message: 'Current password incorrect' });
        }
        user.password = req.body.newPassword;
        await user.save();
        res.json({ success: true, message: 'Password updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc Add XP to user
exports.addXP = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.xp += req.body.xp || 0;
        user.updateLevel();
        await user.save();
        res.json({ success: true, xp: user.xp, level: user.level });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc Get leaderboard (top 10 by XP)
exports.getLeaderboard = async (req, res) => {
    try {
        const users = await User.find({ role: 'student' })
            .sort({ xp: -1 })
            .limit(10)
            .select('name avatar xp level streak');
        res.json({ success: true, leaderboard: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc Get dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        const quizResults = await QuizResult.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(7);
        res.json({ success: true, user, recentQuizResults: quizResults });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// @desc Handle daily reward spin
exports.claimDailySpin = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (user.lastSpinDate && user.lastSpinDate >= startOfToday) {
            return res.status(400).json({ success: false, message: 'You have already spun the wheel today!' });
        }

        const rewards = [50, 100, 150, 200, 250, 500]; // Possible XP rewards
        const reward = rewards[Math.floor(Math.random() * rewards.length)];

        user.xp += reward;
        user.lastSpinDate = now;
        user.updateLevel();
        await user.save();

        res.json({ success: true, reward, xp: user.xp, lastSpinDate: user.lastSpinDate });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
