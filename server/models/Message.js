const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    subject: { type: String, default: 'General' },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
