const https = require('https');
const Message = require('../models/Message');

// LOCAL KNOWLEDGE BASE (LKB) - Instant offline answers
const LKB = {
    General: [
        { keywords: ['hi', 'hello', 'hey', 'greetings'], response: "Hello! I am **GURU AI**, your ultra-fast study companion. How can I help you today? 🧠⚡" },
        { keywords: ['who are you', 'your name', 'about you'], response: "I am **GURU AI Pro**, an advanced educational assistant designed to solve complex logical problems and explain academic concepts with speed! 🚀" },
        { keywords: ['what is english', 'english language', 'about english'], response: "**English** is a West Germanic language that originated in medieval England. 🌍 It is the global language of science, business, and tech." },
        { keywords: ['verb'], response: "A **verb** is a word that describes an **action, state, or occurrence**. 📝 (e.g., *run, be, happen*)" },
        { keywords: ['noun'], response: "A **noun** identifies a **person, place, thing, or idea**. 📚 (e.g., *student, India, book*)" },
        { keywords: ['adjective'], response: "An **adjective** describes a noun. ✨ (e.g., *beautiful, smart, fast*)" },
        { keywords: ['capital', 'india'], response: "The capital of India is **New Delhi**. 🇮🇳" }
    ],
    Programming: [
        { keywords: ['hello world', 'c language'], response: "Hello World in C:\n```c\n#include <stdio.h>\nint main() {\n   printf(\"Hello, World!\\n\");\n   return 0;\n}\n```" },
        { keywords: ['sum of two numbers'], response: "Sum of two numbers in C:\n```c\n#include <stdio.h>\nint main() {\n    int a, b;\n    printf(\"Enter two numbers: \");\n    scanf(\"%d %d\", &a, &b);\n    printf(\"Sum = %d\\n\", a + b);\n    return 0;\n}\n```" },
        { keywords: ['python'], response: "Python is a high-level, beginner-friendly programming language known for its simple syntax. 🐍\n\n```python\nprint('Hello, World!')\n```" },
        { keywords: ['javascript', 'what is', 'function'], response: "JavaScript is a scripting language used to make web pages interactive. 🌐\n\n```js\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\nconsole.log(greet('World'));\n```" }
    ],
    Mathematics: [
        { keywords: ['pi', 'value of pi'], response: "The value of **Pi (π) ≈ 3.14159**. It is the ratio of a circle's circumference to its diameter. 🥧" },
        { keywords: ['pythagoras', 'pythagorean'], response: "**Pythagoras Theorem:** a² + b² = c². 📐" },
        { keywords: ['area of circle'], response: "Area of a circle = **πr²**. ⭕" }
    ],
    Physics: [
        { keywords: ["newton's first", 'first law', 'law of inertia'], response: "**Newton's First Law (Inertia):** 🍎 An object stays at rest or in uniform motion unless acted on by an external force." },
        { keywords: ["newton's second", 'second law', 'f=ma'], response: "**Newton's Second Law:** ⚡ Force = Mass × Acceleration (**F = ma**)." },
        { keywords: ['relativity', 'einstein', 'e=mc2'], response: "**General Relativity:** 🌌 Einstein's theory stating that gravity is the curvature of spacetime caused by mass and energy. **E=mc²** shows mass-energy equivalence." }
    ],
    Logic: [
        { keywords: ['riddle', 'river', 'boat'], response: "**Classic Crossing Riddle:** 🚣‍♂️ \n1. Take Goat. \n2. Go back, take Wolf. \n3. Bring Goat back, take Cabbage. \n4. Go back, take Goat. Done!" },
        { keywords: ['monty hall'], response: "**Monty Hall:** 🚪 **ALWAYS SWITCH!** Your odds double from 33% to 66%." },
        { keywords: ['what is logic'], response: "**Logic** is the study of correct reasoning and mathematical valid inference. 🧠" }
    ],
    Science: [
        { keywords: ['what is chemistry'], response: "**Chemistry** is the study of matter, its properties, and how substances interact. 🧪" },
        { keywords: ['what is physics'], response: "**Physics** is the science of matter, energy, motion, and force. ⚛️" },
        { keywords: ['water', 'formula'], response: "The chemical formula of water is **H₂O**. 💧" }
    ],
    History: [
        { keywords: ['independence', 'india'], response: "India gained independence from British rule on **August 15, 1947**. 🇮🇳" },
        { keywords: ['world war 2', 'ww2'], response: "**World War II** (1939–1945) was a global conflict between the Allies and the Axis powers. It is the deadliest conflict in history. 🎖️" }
    ]
};

// Global Cache to reduce API usage and increase speed
const CHAT_CACHE = new Map();
const CACHE_LIMIT = 100;

const getLocalFallback = (input, subject) => {
    const query = input.toLowerCase();
    const categories = [subject, 'General'];
    for (const cat of categories) {
        if (LKB[cat]) {
            const match = LKB[cat].find(item => item.keywords.some(k => query.includes(k)));
            if (match) return match.response;
        }
    }
    return null;
};

// Math evaluator
const evaluateMath = (text) => {
    try {
        const clean = text.replace(/[=?\s]/g, '').trim();
        if (/^[0-9+\-*/().^%]+$/.test(clean) && clean.length > 2) {
            const js = clean.replace(/\^/g, '**');
            const result = eval(js); // eslint-disable-line no-eval
            const formatted = Number.isInteger(result) ? result : parseFloat(result.toFixed(4));
            return `The result of **${clean}** = **${formatted}** 🧮`;
        }
        return null;
    } catch { return null; }
};

// Direct HTTPS call to Gemini with History Support
const callGeminiDirect = (prompt, history = [], apiKey) => {
    return new Promise((resolve, reject) => {
        // Construct contents with history
        const contents = [];

        // Add past exchanges
        history.forEach(msg => {
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            });
        });

        // Add current prompt
        contents.push({
            role: 'user',
            parts: [{ text: prompt }]
        });

        const body = JSON.stringify({
            contents,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.8,
                topP: 0.95,
                topK: 40
            },
            // System instructions (System prompt) is sent as the first content in some versions or via separate field
            // For v1beta, we can prepend it to the first user message or use safe instructions
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            },
            timeout: 20000
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.error) return reject(json.error);
                    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) return resolve(text);
                    reject(new Error('Empty response from API'));
                } catch (e) {
                    reject(new Error('Invalid JSON from API'));
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
        req.write(body);
        req.end();
    });
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const getAIResponse = async (content, subject, history = [], attempt = 1) => {
    const input = content.trim();
    if (!input) return "I'm listening! Ask me anything. 😊";

    // 1. Math evaluation (Simple check)
    const math = evaluateMath(input);
    if (math && history.length === 0) return math;

    // 2. Local Knowledge Base (Instant & Offline)
    const local = getLocalFallback(input, subject);
    if (local && history.length === 0) return local;

    // 3. Cache Check (Zero-Latency for repeating queries)
    const cacheKey = `${subject}:${input.toLowerCase()}`;
    if (CHAT_CACHE.has(cacheKey)) {
        return CHAT_CACHE.get(cacheKey) + "\n\n*(⚡ Instant response from cache)*";
    }

    // 4. Real Gemini AI
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey || apiKey.length < 20) {
        return "⚠️ No API key configured. Please add `GEMINI_API_KEY` to the server `.env` file.";
    }

    try {
        const systemPrompt = `You are **GURU AI PRO**.
Be extremely fast, powerful, and precise. 
For logic/math: Use step-by-step reasoning.
Tone: Expert Tutor. 😉
Current Subject: ${subject}`;

        const finalPrompt = history.length === 0 ? `${systemPrompt}\n\nStudent: ${input}` : input;
        const text = await callGeminiDirect(finalPrompt, history, apiKey);

        // Update Cache
        if (CHAT_CACHE.size >= CACHE_LIMIT) CHAT_CACHE.clear();
        CHAT_CACHE.set(cacheKey, text);

        return text;

    } catch (error) {
        const msg = (error.message || '').toLowerCase();
        const code = error.code || error.status || '';
        console.error(`❌ Gemini API Error (attempt ${attempt}):`, error.message || JSON.stringify(error));

        if ((code === 429 || msg.includes('429')) && attempt < 2) {
            await sleep(3000);
            return getAIResponse(content, subject, history, attempt + 1);
        }

        if (code === 429 || msg.includes('quota')) {
            return "⏳ **Quota Exhausted**: Gemini free tier is busy. Try again in 60s.\n*GURU AI is working on it!*";
        }

        if (msg.includes('leaked') || msg.includes('safety') || code === 400) {
            return "🛑 **Security Block**: Your API key was reported as leaked (likely because it was visible in a public place). \n\n**Action Required:** \n1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey). \n2. Delete the old key. \n3. Generate a **NEW** key. \n4. Update it in your `.env` file.";
        }

        return `🛸 GURU AI Error: ${error.message}`;
    }
};

// ─── Controller Exports ─────────────────────────────────────
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ user: req.user._id }).sort({ createdAt: 1 }).limit(50);
        res.json({ success: true, messages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { content, subject = 'General' } = req.body;

        // Fetch last 6 messages for context
        const history = await Message.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(6);

        // Reverse to get chronological order
        const formattedHistory = history.reverse().map(m => ({
            role: m.role,
            content: m.content
        }));

        await Message.create({ user: req.user._id, role: 'user', content, subject });
        const aiText = await getAIResponse(content, subject, formattedHistory);
        const aiMsg = await Message.create({ user: req.user._id, role: 'assistant', content: aiText, subject });

        res.json({ success: true, message: aiMsg });
    } catch (err) {
        console.error('❌ sendMessage Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.clearMessages = async (req, res) => {
    try {
        await Message.deleteMany({ user: req.user._id });
        res.json({ success: true, message: 'Chat cleared' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
