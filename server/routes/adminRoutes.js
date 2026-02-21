const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, getAllQuestions, updateQuestion, getAnalytics } = require('../controllers/adminController');
const { protect, adminGuard } = require('../middleware/auth');

router.use(protect, adminGuard);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/questions', getAllQuestions);
router.put('/questions/:id', updateQuestion);
router.get('/analytics', getAnalytics);

module.exports = router;
