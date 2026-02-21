const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    subject: { type: String, required: true, enum: ['Mathematics', 'Science', 'English', 'Programming', 'General Knowledge'] },
    difficulty: { type: String, required: true, enum: ['Easy', 'Moderate', 'Hard', 'Challenge'] },
    question: { type: String, required: true },
    options: { type: [String], required: true, validate: v => v.length === 4 },
    answer: { type: Number, required: true, min: 0, max: 3 }, // index of correct option
    explanation: { type: String, default: '' },
    xpReward: { type: Number, default: 10 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
