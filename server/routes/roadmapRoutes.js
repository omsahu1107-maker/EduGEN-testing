const express = require('express');
const router = express.Router();
const { getRoadmap, getProgress, toggleTopic, generateRoadmap } = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRoadmap);
router.get('/progress', protect, getProgress);
router.post('/progress/toggle', protect, toggleTopic);
router.post('/generate', protect, generateRoadmap);

module.exports = router;
