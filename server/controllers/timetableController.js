const Timetable = require('../models/Timetable');

exports.getSlots = async (req, res) => {
    try {
        const slots = await Timetable.find({ user: req.user._id });
        res.json({ success: true, slots });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.addSlot = async (req, res) => {
    try {
        const slot = await Timetable.create({ ...req.body, user: req.user._id });
        res.status(201).json({ success: true, slot });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateSlot = async (req, res) => {
    try {
        const slot = await Timetable.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body, { new: true }
        );
        if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
        res.json({ success: true, slot });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteSlot = async (req, res) => {
    try {
        await Timetable.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ success: true, message: 'Slot deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
