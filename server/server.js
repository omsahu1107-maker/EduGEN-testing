require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const goalRoutes = require('./routes/goalRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'https://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            process.env.CLIENT_URL,
        ].filter(Boolean);

        const isVercel = origin && origin.endsWith('.vercel.app');

        // Allow requests with no origin (like mobile apps or curl) or Vercel
        if (!origin || allowedOrigins.includes(origin) || isVercel) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Rate limiting (express-rate-limit v7 API)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    legacyHeaders: false,
    standardHeaders: 'draft-7',
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Middleware
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', version: '1.0.0', app: 'EduGEN API' }));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Connect DB & Start
const PORT = process.env.PORT || 5001;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(PORT, () => console.log(`🚀 EduGEN server running on http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });

module.exports = app;
