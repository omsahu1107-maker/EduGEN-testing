const express = require('express');
const router = express.Router();
const { getQuestions, submitQuiz, getQuizHistory, getResult, addQuestion, deleteQuestion } = require('../controllers/quizController');
const { protect, adminGuard } = require('../middleware/auth');

router.get('/questions', protect, getQuestions);
router.post('/submit', protect, submitQuiz);
router.get('/history', protect, getQuizHistory);
router.get('/result/:id', protect, getResult);
// Admin
router.post('/questions', protect, adminGuard, addQuestion);
router.delete('/questions/:id', protect, adminGuard, deleteQuestion);

module.exports = router;
