const express = require('express');
const router = express.Router();
const { startSession, endSession, getSessions } = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSessions);
router.post('/start', protect, startSession);
router.put('/:id/end', protect, endSession);

module.exports = router;
