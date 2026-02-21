const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['pomodoro', 'focus', 'break'], default: 'pomodoro' },
    duration: { type: Number, required: true }, // minutes
    subject: { type: String, default: 'General' },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    completed: { type: Boolean, default: false },
    xpEarned: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('StudySession', studySessionSchema);
