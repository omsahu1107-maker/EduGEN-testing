const StudySession = require('../models/StudySession');
const User = require('../models/User');

exports.startSession = async (req, res) => {
    try {
        const session = await StudySession.create({
            ...req.body, user: req.user._id, startedAt: new Date(),
        });
        res.status(201).json({ success: true, session });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.endSession = async (req, res) => {
    try {
        const session = await StudySession.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { endedAt: new Date(), completed: true, xpEarned: req.body.xpEarned || 20 },
            { new: true }
        );
        if (session && session.completed) {
            const user = await User.findById(req.user._id);
            const hours = session.duration / 60;
            user.totalStudyHours = (user.totalStudyHours || 0) + hours;
            user.xp += session.xpEarned;
            user.updateLevel();
            await user.save();
        }
        res.json({ success: true, session });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getSessions = async (req, res) => {
    try {
        const sessions = await StudySession.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
        res.json({ success: true, sessions });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
