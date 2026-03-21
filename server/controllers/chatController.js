const https = require('https');
const Message = require('../models/Message');

// LOCAL KNOWLEDGE BASE (LKB) - Instant offline answers
const LKB = {
    General: [
        { keywords: ['hi', 'hello', 'hey', 'greetings'], response: "Hello! I am **GURU AI PRO**, your ultra-fast study companion. How can I push your learning boundaries today? 🧠⚡" },
        { keywords: ['who are you', 'your name', 'about you'], response: "I am **GURU AI Pro**, an elite educational intelligence designed to solve complex logical problems and explain academic concepts with maximum precision! 🚀" },
        { keywords: ['what is english', 'english language', 'about english'], response: "**English** is a West Germanic language that originated in medieval England. 🌍 It is the global language of science, business, and tech." },
        { keywords: ['verb'], response: "A **verb** is a word that describes an **action, state, or occurrence**. 📝 (e.g., *run, be, happen*)" },
        { keywords: ['noun'], response: "A **noun** identifies a **person, place, thing, or idea**. 📚 (e.g., *student, India, book*)" },
        { keywords: ['adjective'], response: "An **adjective** describes a noun. ✨ (e.g., *beautiful, smart, fast*)" },
        { keywords: ['capital', 'india'], response: "The capital of India is **New Delhi**. 🇮🇳" },
        { keywords: ['capital', 'france'], response: "The capital of France is **Paris**. 🇫🇷" },
        { keywords: ['capital', 'japan'], response: "The capital of Japan is **Tokyo**. 🇯🇵" },
        { keywords: ['largest desert'], response: "The **Sahara** is the largest hot desert, but **Antarctica** is technically the largest desert overall. 🏜️❄️" }
    ],
    Programming: [
        { keywords: ['hello world', 'c language'], response: "Hello World in C:\n```c\n#include <stdio.h>\nint main() {\n   printf(\"Hello, World!\\n\");\n   return 0;\n}\n```" },
        { keywords: ['sum of two numbers'], response: "Sum of two numbers in C:\n```c\n#include <stdio.h>\nint main() {\n    int a, b;\n    printf(\"Enter two numbers: \");\n    scanf(\"%d %d\", &a, &b);\n    printf(\"Sum = %d\\n\", a + b);\n    return 0;\n}\n```" },
        { keywords: ['python'], response: "Python is a high-level, beginner-friendly programming language known for its simple syntax. 🐍\n\n```python\nprint('Hello, World!')\n```" },
        { keywords: ['javascript', 'what is', 'function'], response: "JavaScript is a scripting language used to make web pages interactive. 🌐\n\n```js\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\nconsole.log(greet('World'));\n```" },
        { keywords: ['html'], response: "**HTML (HyperText Markup Language)** is the standard markup language for creating web pages. 🏗️ It defines the structure of a page." },
        { keywords: ['css'], response: "**CSS (Cascading Style Sheets)** describes how HTML elements are to be displayed on screen, paper, or in other media. 🎨" },
        { keywords: ['git'], response: "**Git** is a distributed version control system for tracking changes in source code during software development. 🌿" }
    ],
    Mathematics: [
        { keywords: ['pi', 'value of pi'], response: "The value of **Pi (π) ≈ 3.14159265...**. It represents the ratio of a circle's circumference to its diameter. 🥧" },
        { keywords: ['pythagoras', 'pythagorean'], response: "**Pythagoras Theorem:** In a right-angled triangle, a² + b² = c². 📐" },
        { keywords: ['area of circle'], response: "Area of a circle = **πr²**. ⭕" },
        { keywords: ['prime number'], response: "A **prime number** is a whole number greater than 1 whose only factors are 1 and itself. (e.g., 2, 3, 5, 7, 11) 🔢" },
        { keywords: ['quadratic formula'], response: "The quadratic formula: **x = [ -b ± √(b² - 4ac) ] / 2a**. 🧮" },
        { keywords: ['fibonacci'], response: "The **Fibonacci sequence** is a series where each number is the sum of the two preceding ones: 0, 1, 1, 2, 3, 5, 8, 13... 🌀" }
    ],
    Physics: [
        { keywords: ["newton's first", 'first law', 'law of inertia'], response: "**Newton's First Law (Inertia):** 🍎 An object stays at rest or in uniform motion unless acted on such by an external force." },
        { keywords: ["newton's second", 'second law', 'f=ma'], response: "**Newton's Second Law:** ⚡ Force = Mass × Acceleration (**F = ma**)." },
        { keywords: ["newton's third", 'third law'], response: "**Newton's Third Law:** For every action, there is an equal and opposite reaction. 🎯" },
        { keywords: ['relativity', 'einstein', 'e=mc2'], response: "**General Relativity:** 🌌 Einstein's theory stating that gravity is the curvature of spacetime. **E=mc²** shows that mass and energy are interchangeable." },
        { keywords: ['speed of light'], response: "The speed of light in a vacuum is exactly **299,792,458 meters per second** (~300,000 km/s). ⚡" }
    ],
    Biology: [
        { keywords: ['mitochondria'], response: "The **Mitochondria** is the powerhouse of the cell! ⚡ It generates chemical energy in the form of ATP." },
        { keywords: ['dna'], response: "**DNA (Deoxyribonucleic acid)** is the molecule that carries genetic instructions in all living organisms. 🧬" },
        { keywords: ['photosynthesis'], response: "**Photosynthesis** is the process used by plants to convert light energy into chemical energy (glucose). 🌿☀️" }
    ],
    Chemistry: [
        { keywords: ['periodic table'], response: "The **Periodic Table** organizes all known chemical elements by atomic number. 🧪" },
        { keywords: ['ph scale'], response: "The **pH scale** measures how acidic or basic a substance is. 0-6 is acidic, 7 is neutral (water), and 8-14 is basic. 💧" },
        { keywords: ['atom'], response: "An **atom** consists of a nucleus (protons and neutrons) surrounded by electrons. It's the basic unit of a chemical element. ⚛️" },
        { keywords: ['gold', 'symbol'], response: "The chemical symbol for Gold is **Au** (from Latin: Aurum). ✨" }
    ],
    Logic: [
        { keywords: ['riddle', 'river', 'boat'], response: "**Classic Crossing Riddle:** 🚣‍♂️ \n1. Take Goat. \n2. Go back, take Wolf. \n3. Bring Goat back, take Cabbage. \n4. Go back, take Goat. Done!" },
        { keywords: ['monty hall'], response: "**Monty Hall:** 🚪 **ALWAYS SWITCH!** Your odds double from 33% to 66% because the host's action gives you metadata." },
        { keywords: ['what is logic'], response: "**Logic** is the study of correct reasoning and valid inference. 🧠" }
    ],
    Science: [
        { keywords: ['what is chemistry'], response: "**Chemistry** is the study of matter, its properties, and how substances interact. 🧪" },
        { keywords: ['what is physics'], response: "**Physics** is the science of matter, energy, motion, and force. ⚛️" },
        { keywords: ['water', 'formula'], response: "The chemical formula of water is **H₂O**. 💧" },
        { keywords: ['gravity'], response: "**Gravity** is the natural force that attracts any two objects with mass. 🌎🍎" }
    ],
    History: [
        { keywords: ['independence', 'india'], response: "India gained independence from British rule on **August 15, 1947**. 🇮🇳" },
        { keywords: ['world war 2', 'ww2'], response: "**World War II** (1939–1945) was a global conflict that involved the vast majority of the world's countries. 🎖️" },
        { keywords: ['civil war'], response: "The **American Civil War** (1861–1865) was fought between the Northern states (Union) and the Southern states (Confederacy). 🇺🇸" }
    ]
};

// Global Cache to reduce API usage and increase speed
const CHAT_CACHE = new Map();
const CACHE_LIMIT = 100;

const getLocalFallback = (input, subject) => {
    const query = input.toLowerCase();

    // Clean query to remove common filler phrases
    const cleanedQuery = query.replace(/^(what is|define|tell me about|how to|explain)\s+/i, '').trim();

    const categories = [subject, 'General'];
    for (const cat of categories) {
        if (LKB[cat]) {
            const match = LKB[cat].find(item =>
                item.keywords.some(k => query.includes(k) || cleanedQuery === k)
            );
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

// Direct HTTPS call to Gemini with History and System Instruction Support
const callGeminiDirect = (prompt, history = [], apiKey, model = 'gemini-2.0-flash', extraContext = {}) => {
    return new Promise((resolve, reject) => {
        const contents = [];

        // Add history correctly formatted
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
            system_instruction: {
                parts: [{
                    text: `You are GURU AI PRO, an elite academic assistant and logical solver. 
                    STUDENT INFO:
                    - Name: ${extraContext.name || 'Student'}
                    - Level: ${extraContext.level || 'Beginner'}
                    - XP: ${extraContext.xp || 0}
                    
                    RULES:
                    1. Use high-speed, expert reasoning.
                    2. For Math/Code: Use professional formatting (Latex/Markdown).
                    3. Tone: Encouraging, ultra-smart, and helpful.
                    4. Reference the student's level to tailor explanations.
                    5. Use emojis to keep it engaging.`
                }]
            },
            generationConfig: {
                maxOutputTokens: 1500,
                temperature: 0.8,
                topP: 0.95
            }
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
                    if (json.error) return reject({ message: json.error.message, code: json.error.code });
                    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) return resolve(text);
                    reject(new Error('Empty response from AI engine'));
                } catch (e) {
                    reject(new Error('Invalid response format'));
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Network timeout')); });
        req.write(body);
        req.end();
    });
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const getAIResponse = async (content, subject, history = [], user = {}, attempt = 1) => {
    const input = content.trim();
    if (!input) return "I'm listening! Ask me any academic question. 😊";

    // 1. Math evaluation (Simple check)
    const math = evaluateMath(input);
    if (math && history.length === 0) return math;

    // 2. Local Knowledge Base (Instant & Offline)
    const local = getLocalFallback(input, subject);
    if (local && history.length === 0) return local;

    // 3. Cache Check (Zero-Latency for repeating queries)
    const cacheKey = `${subject}:${input.toLowerCase()}`;
    if (CHAT_CACHE.has(cacheKey)) {
        return CHAT_CACHE.get(cacheKey) + "\n\n*(⚡ Response from ultra-fast cache)*";
    }

    // 4. Real Gemini AI
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey || apiKey.length < 20) {
        return "⚠️ **AI Not Configured**: Please add your `GEMINI_API_KEY` to the `.env` file.";
    }

    try {
        // Fallback between models if one is busy
        const model = attempt === 1 ? 'gemini-2.0-flash' : 'gemini-1.5-flash';
        const text = await callGeminiDirect(input, history, apiKey, model, {
            name: user.name,
            level: user.level,
            xp: user.xp
        });

        // Update Cache
        if (CHAT_CACHE.size >= CACHE_LIMIT) CHAT_CACHE.clear();
        CHAT_CACHE.set(cacheKey, text);

        return text;

    } catch (error) {
        const msg = (error.message || '').toLowerCase();
        const code = error.code || error.status || '';
        console.error(`❌ Gemini API Error (attempt ${attempt}):`, error.message || JSON.stringify(error));

        if ((code === 429 || msg.includes('429')) && attempt < 2) {
            await sleep(2000);
            return getAIResponse(content, subject, history, attempt + 1);
        }

        if (code === 429 || msg.includes('quota')) {
            return "⏳ **Quota Exhausted**: Gemini free tier is busy. Try again in 30s. 🚀";
        }

        if (msg.includes('leaked') || msg.includes('safety') || code === 400) {
            return "🛑 **Security Block**: Your API key was reported as leaked. \n\n**Action Required:** \n1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey). \n2. Generate a **NEW** key. \n3. Update it in your `.env` file.";
        }

        return `🛰️ **Offline Mode**: I'm having trouble reaching the AI brain. Please try again soon, or ask about something in my local knowledge base!`;
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
        const aiText = await getAIResponse(content, subject, formattedHistory, req.user);
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
