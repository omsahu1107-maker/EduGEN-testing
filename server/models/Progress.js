const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    level: { type: String, required: true },
    completedTopics: { type: [String], default: [] },
}, { timestamps: true });

progressSchema.index({ user: 1, subject: 1, level: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
