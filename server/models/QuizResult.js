const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    difficulty: { type: String, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    timeTaken: { type: Number, default: 0 }, // seconds
    xpEarned: { type: Number, default: 0 },
    answers: [{
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOption: Number,
        correct: Boolean,
    }],
}, { timestamps: true });

module.exports = mongoose.model('QuizResult', quizResultSchema);
