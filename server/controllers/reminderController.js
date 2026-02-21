const Reminder = require('../models/Reminder');

exports.getReminders = async (req, res) => {
    try {
        const reminders = await Reminder.find({ user: req.user._id }).sort({ datetime: 1 });
        res.json({ success: true, reminders });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.addReminder = async (req, res) => {
    try {
        const reminder = await Reminder.create({ ...req.body, user: req.user._id });
        res.status(201).json({ success: true, reminder });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body, { new: true }
        );
        res.json({ success: true, reminder });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteReminder = async (req, res) => {
    try {
        await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ success: true, message: 'Reminder deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
