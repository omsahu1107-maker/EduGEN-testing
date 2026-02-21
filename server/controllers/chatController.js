const https = require('https');
const Message = require('../models/Message');

// LOCAL KNOWLEDGE BASE (LKB) - Instant offline answers
const LKB = {
    General: [
        { keywords: ['what is english', 'english language', 'about english'], response: "**English** is a West Germanic language that originated in medieval England. 🌍\n\nIt is the world's most widely spoken language with **~1.5 billion** speakers and serves as the global language of science, business, technology, and international diplomacy." },
        { keywords: ['verb'], response: "A **verb** is a word that describes an **action, state, or occurrence**. It is the most important part of a sentence! 📝\n\n**Examples:**\n- Action: *run, dance, read, write*\n- State: *be, seem, feel, know*\n- Occurrence: *happen, occur, develop*" },
        { keywords: ['noun'], response: "A **noun** is a word that identifies a **person, place, thing, or idea**. 📚\n\n**Examples:**\n- Person: *student, teacher, doctor*\n- Place: *India, school, city*\n- Thing: *book, computer, phone*\n- Idea: *freedom, love, knowledge*" },
        { keywords: ['adjective'], response: "An **adjective** is a describing word that modifies a noun or pronoun. ✨\n\n**Examples:** *beautiful, smart, large, red, happy*\n\n*'The **smart** student passed the **difficult** exam.'*" },
        { keywords: ['capital', 'india'], response: "The capital of India is **New Delhi**. 🇮🇳" }
    ],
    Programming: [
        { keywords: ['hello world', 'c language'], response: "Hello World in C:\n```c\n#include <stdio.h>\nint main() {\n   printf(\"Hello, World!\\n\");\n   return 0;\n}\n```" },
        { keywords: ['sum of two numbers'], response: "Sum of two numbers in C:\n```c\n#include <stdio.h>\nint main() {\n    int a, b;\n    printf(\"Enter two numbers: \");\n    scanf(\"%d %d\", &a, &b);\n    printf(\"Sum = %d\\n\", a + b);\n    return 0;\n}\n```" },
        { keywords: ['python'], response: "Python is a high-level, beginner-friendly programming language known for its simple syntax. 🐍\n\n```python\nprint('Hello, World!')\n```" },
        { keywords: ['javascript', 'what is', 'function'], response: "JavaScript is a scripting language used to make web pages interactive. 🌐\n\n```js\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\nconsole.log(greet('World'));\n```" }
    ],
    Mathematics: [
        { keywords: ['pi', 'value of pi'], response: "The value of **Pi (π) ≈ 3.14159265358979...**  🥧\n\nPi is the ratio of a circle's circumference to its diameter. It is an **irrational number** that goes on forever without repeating!" },
        { keywords: ['pythagoras', 'pythagorean'], response: "**Pythagoras Theorem** states:\n> a² + b² = c²\n\nWhere **c** is the hypotenuse (longest side) of a right triangle. 📐" }
    ],
    Physics: [
        { keywords: ["newton's first", 'first law', 'law of inertia'], response: "**Newton's First Law of Motion (Law of Inertia):** 🍎\n\n*An object at rest stays at rest, and an object in motion stays in motion with the same speed and direction, **unless acted upon by an external force**.*" },
        { keywords: ["newton's second", 'second law', 'f=ma'], response: "**Newton's Second Law of Motion:** ⚡\n\n*Force = Mass × Acceleration*\n\n**F = ma**\n\nThe greater the force applied to an object, the greater its acceleration." }
    ]
};

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

// Direct HTTPS call to Gemini (bypasses SDK fetch issues on Windows)
const callGeminiDirect = (prompt, apiKey) => {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            },
            timeout: 15000
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

const getAIResponse = async (content, subject, attempt = 1) => {
    const input = content.trim();
    if (!input) return "I'm listening! Ask me anything. 😊";

    // 1. Math evaluation
    const math = evaluateMath(input);
    if (math) return math;

    // 2. Local Knowledge Base (instant, offline)
    const local = getLocalFallback(input, subject);
    if (local) return local;

    // 3. Real Gemini AI (via direct HTTPS)
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey || apiKey.length < 20) {
        return "⚠️ No API key configured. Please add `GEMINI_API_KEY` to the server `.env` file.";
    }

    try {
        const prompt = `You are EduGEN AI, an expert educational tutor.
Subject: ${subject}
Student Question: "${input}"

Provide a clear, helpful answer with markdown formatting (bold, bullet points, code blocks if needed) and 1-2 relevant emojis. Keep it concise but complete.`;

        const text = await callGeminiDirect(prompt, apiKey);
        return text;

    } catch (error) {
        const msg = (error.message || '').toLowerCase();
        const code = error.code || error.status || '';
        console.error(`❌ Gemini API Error (attempt ${attempt}):`, error.message || JSON.stringify(error));

        // Quota exceeded — retry once after delay
        if ((code === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('exceed')) && attempt < 2) {
            console.log('🔄 Quota hit, retrying in 3s...');
            await sleep(3000);
            return getAIResponse(content, subject, attempt + 1);
        }

        if (code === 429 || msg.includes('quota') || msg.includes('exceed')) {
            return "⏳ **AI Quota Reached**: You've hit the free tier limit. Please wait 1 minute before asking again.\n\n*Tip: I can still answer common questions from my offline knowledge base!*";
        }

        if (msg.includes('timed out') || msg.includes('timeout')) {
            return "🕐 **Request Timeout**: The AI took too long to respond. Please try again in a few seconds.";
        }

        if (msg.includes('invalid') || msg.includes('api key') || code === 400 || code === 401) {
            return "🔑 **Invalid API Key**: The GEMINI_API_KEY in `.env` is not valid. Please generate a new key from [Google AI Studio](https://aistudio.google.com/).";
        }

        return `🛸 AI is temporarily unavailable. Please try again in a moment. *(${error.message})*`;
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
        await Message.create({ user: req.user._id, role: 'user', content, subject });
        const aiText = await getAIResponse(content, subject);
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
