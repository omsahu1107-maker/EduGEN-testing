const https = require('https');
const Question = require('../models/Question');
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');

// ── Direct HTTPS call to Gemini (no SDK, works reliably on Windows) ──
const callGeminiDirect = (prompt) => {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey || apiKey.length < 20) return Promise.reject(new Error('No API key'));

    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 2000, temperature: 0.7 }
        });
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
            timeout: 20000
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.error) return reject(Object.assign(new Error(json.error.message), { code: json.error.code }));
                    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) return resolve(text);
                    reject(new Error('Empty response'));
                } catch (e) { reject(new Error('Invalid JSON from AI')); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
        req.write(body);
        req.end();
    });
};

// ── Generate dynamic MCQs via Gemini ─────────────────────────
const generateAIQuestions = async (subject, difficulty, limit) => {
    const prompt = `You are an expert ${subject} teacher. Generate exactly ${limit} unique multiple-choice questions for difficulty level: ${difficulty}.

Return ONLY a valid JSON array. No markdown, no explanation, no text before or after the array.
Format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0,
    "explanation": "Why this is correct",
    "xpReward": 20
  }
]
The "answer" field MUST be the index (0, 1, 2, or 3) of the correct option in the "options" array.`;

    try {
        let text = await callGeminiDirect(prompt);
        text = text.trim();
        if (text.includes('```')) text = text.replace(/```json|```/g, '').trim();

        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) return null;

        // Save to DB (without isDynamic field which doesn't exist in schema)
        const saved = [];
        for (const q of parsed.slice(0, limit)) {
            try {
                const created = await Question.create({
                    question: q.question,
                    options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['A', 'B', 'C', 'D'],
                    answer: typeof q.answer === 'number' && q.answer >= 0 && q.answer <= 3 ? q.answer : 0,
                    explanation: q.explanation || '',
                    xpReward: q.xpReward || 20,
                    subject,
                    difficulty,
                });
                saved.push(created);
            } catch (saveErr) {
                console.error('⚠️ Question save error:', saveErr.message);
            }
        }
        return saved.length > 0 ? saved : null;
    } catch (err) {
        console.error('❌ AI Question generation error:', err.message);
        return null;
    }
};

// ── @desc  Get questions ───────────────────────────────────────
exports.getQuestions = async (req, res) => {
    try {
        const { subject, difficulty, limit = 10, mode = 'static' } = req.query;

        // Try AI only when explicitly requested
        if (mode === 'dynamic') {
            console.log(`🤖 Generating AI questions for ${subject} (${difficulty})...`);
            const aiQuestions = await generateAIQuestions(subject, difficulty, parseInt(limit));
            if (aiQuestions && aiQuestions.length > 0) {
                const sanitized = aiQuestions.map(q => ({
                    _id: q._id, subject: q.subject, difficulty: q.difficulty,
                    question: q.question, options: q.options, xpReward: q.xpReward,
                }));
                return res.json({ success: true, questions: sanitized, source: 'AI_Live' });
            }
            console.log('⚠️ AI generation failed, falling back to DB...');
        }

        // Static DB mode — always works
        const filter = {};
        if (subject) filter.subject = subject;
        if (difficulty) filter.difficulty = difficulty;

        let questions = await Question.find(filter).lean();

        // Shuffle for variety
        questions = questions.sort(() => 0.5 - Math.random()).slice(0, parseInt(limit));

        // Ultimate fallback: any questions if none match the filter
        if (questions.length === 0) {
            questions = await Question.find({}).limit(parseInt(limit)).lean();
        }

        const sanitized = questions.map(q => ({
            _id: q._id, subject: q.subject, difficulty: q.difficulty,
            question: q.question, options: q.options, xpReward: q.xpReward,
        }));

        res.json({ success: true, questions: sanitized, source: 'DB' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── @desc  Submit quiz ────────────────────────────────────────
exports.submitQuiz = async (req, res) => {
    try {
        const { subject, difficulty, answers, timeTaken } = req.body;
        let correct = 0;
        const evaluated = [];

        for (const ans of answers) {
            let q = null;
            try { q = await Question.findById(ans.questionId); } catch (_) { }
            const isCorrect = q && q.answer === ans.selectedOption;
            if (isCorrect) correct++;
            evaluated.push({
                questionId: ans.questionId,
                selectedOption: ans.selectedOption,
                correct: isCorrect,
                correctAnswer: q ? q.answer : null,
                explanation: q ? q.explanation : '',
            });
        }

        const total = answers.length;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        let xpEarned = correct * 15;
        if (difficulty === 'Hard') xpEarned = Math.round(xpEarned * 1.5);
        if (difficulty === 'Challenge') xpEarned = Math.round(xpEarned * 2);

        const result = await QuizResult.create({
            user: req.user._id, subject, difficulty,
            totalQuestions: total, correctAnswers: correct,
            accuracy, timeTaken: timeTaken || 0, xpEarned, answers: evaluated,
        });

        const user = await User.findById(req.user._id);
        if (user) {
            user.xp += xpEarned;
            user.updateLevel();
            await user.save();
        }

        res.json({ success: true, result, xpEarned, accuracy, correct, total });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── @desc  Quiz history ───────────────────────────────────────
exports.getQuizHistory = async (req, res) => {
    try {
        const results = await QuizResult.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
        res.json({ success: true, results });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── @desc  Get single result ──────────────────────────────────
exports.getResult = async (req, res) => {
    try {
        const result = await QuizResult.findById(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
        res.json({ success: true, result });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── @desc  Add question (admin) ───────────────────────────────
exports.addQuestion = async (req, res) => {
    try {
        const q = await Question.create({ ...req.body, createdBy: req.user._id });
        res.status(201).json({ success: true, question: q });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── @desc  Delete question (admin) ────────────────────────────
exports.deleteQuestion = async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Question deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
