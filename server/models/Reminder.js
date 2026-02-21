const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['study', 'exam', 'homework', 'motivational'], default: 'study' },
    datetime: { type: Date, required: true },
    recurring: { type: String, enum: ['none', 'daily', 'weekly'], default: 'none' },
    active: { type: Boolean, default: true },
    icon: { type: String, default: '⏰' },
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);
