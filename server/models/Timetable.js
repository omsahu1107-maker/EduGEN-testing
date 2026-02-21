const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    subject: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    color: { type: String, default: '#6366f1' },
    label: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
