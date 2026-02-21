const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
    xpReward: { type: Number, default: 25 },
    completed: { type: Boolean, default: false },
    completedAt: Date,
    dueDate: { type: Date },
    icon: { type: String, default: '🎯' },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
