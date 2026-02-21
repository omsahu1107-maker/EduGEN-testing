const Goal = require('../models/Goal');
const User = require('../models/User');

exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, goals });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.addGoal = async (req, res) => {
    try {
        const goal = await Goal.create({ ...req.body, user: req.user._id });
        res.status(201).json({ success: true, goal });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body, { new: true }
        );
        res.json({ success: true, goal });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.completeGoal = async (req, res) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
        if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
        goal.completed = true;
        goal.completedAt = new Date();
        await goal.save();

        // Award XP
        const user = await User.findById(req.user._id);
        user.xp += goal.xpReward;
        user.updateLevel();
        await user.save();

        res.json({ success: true, goal, xpEarned: goal.xpReward });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteGoal = async (req, res) => {
    try {
        await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ success: true, message: 'Goal deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
