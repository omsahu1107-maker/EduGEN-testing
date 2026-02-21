const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, clearMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMessages);
router.post('/', protect, sendMessage);
router.delete('/clear', protect, clearMessages);

module.exports = router;
