const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @desc Register user
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, referralCode } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

        let referredBy = null;
        if (referralCode) {
            const referrer = await User.findOne({ referralCode });
            if (referrer) {
                referredBy = referrer._id;
                referrer.xp += 500;
                referrer.referralCount += 1;
                referrer.updateLevel();
                await referrer.save();
            }
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role === 'admin' ? 'admin' : 'student',
            referredBy
        });

        const token = generateToken(user._id);
        res.status(201).json({
            success: true,
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, xp: user.xp, level: user.level, streak: user.streak, avatar: user.avatar, totalStudyHours: user.totalStudyHours, language: user.language, referralCode: user.referralCode },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Update streak
        const today = new Date().toDateString();
        const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate).toDateString() : null;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (lastLogin === yesterday) user.streak += 1;
        else if (lastLogin !== today) user.streak = 1;
        user.lastLoginDate = new Date();
        await user.save();

        const token = generateToken(user._id);
        res.json({
            success: true,
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, xp: user.xp, level: user.level, streak: user.streak, avatar: user.avatar, theme: user.theme, totalStudyHours: user.totalStudyHours, language: user.language, referralCode: user.referralCode },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc Logout
exports.logout = (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.json({ success: true, message: 'Logged out' });
};

// @desc Get current user
exports.getMe = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
};

// @desc Forgot password
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ success: false, message: 'No user with that email' });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
        await user.save({ validateBeforeSave: false });

        res.json({ success: true, message: `Reset token: ${resetToken}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc Reset password
exports.resetPassword = async (req, res) => {
    try {
        const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ success: true, message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
