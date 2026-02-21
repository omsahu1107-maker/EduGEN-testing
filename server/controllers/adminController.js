const User = require('../models/User');
const Question = require('../models/Question');
const QuizResult = require('../models/QuizResult');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 });
        res.json({ success: true, questions });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateQuestion = async (req, res) => {
    try {
        const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, question: q });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalQuizzes = await QuizResult.countDocuments();
        const avgAccuracy = await QuizResult.aggregate([{ $group: { _id: null, avg: { $avg: '$accuracy' } } }]);
        const bySubject = await QuizResult.aggregate([{ $group: { _id: '$subject', count: { $sum: 1 } } }]);
        res.json({ success: true, analytics: { totalUsers, totalQuizzes, avgAccuracy: avgAccuracy[0]?.avg || 0, bySubject } });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
