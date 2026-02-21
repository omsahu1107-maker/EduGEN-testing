const https = require('https');
const Progress = require('../models/Progress');
const ROADMAP_DATA = require('../data/roadmapData');

// ── Direct HTTPS to Gemini (no SDK, reliable on Windows) ──────
const callGeminiDirect = (prompt, apiKey) => {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 2000, temperature: 0.6 }
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
                    reject(new Error('Empty AI response'));
                } catch (e) { reject(new Error('Invalid JSON from AI')); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timed out')); });
        req.write(body);
        req.end();
    });
};

// ── Comprehensive local roadmaps (quota-free, instant) ────────
const LOCAL_ROADMAPS = {
    python: {
        title: 'Python Learning Roadmap', description: 'Complete guide from Python basics to advanced.', estimatedDays: 60,
        stages: [
            { id: 'py1', title: 'Foundations', icon: '🌱', color: '#10b981', duration: '2 weeks', description: 'Core Python syntax and basics', steps: [{ id: 's1', title: 'Install Python & VS Code', resource: 'python.org' }, { id: 's2', title: 'Variables, Data Types & Input', resource: 'W3Schools Python' }, { id: 's3', title: 'Conditionals (if/elif/else)', resource: 'Python Docs' }, { id: 's4', title: 'Loops: for and while', resource: 'W3Schools' }, { id: 's5', title: 'Functions and Scope', resource: 'Real Python' }] },
            { id: 'py2', title: 'Data Structures', icon: '⚡', color: '#06b6d4', duration: '2 weeks', description: 'Python built-in data structures', steps: [{ id: 's1', title: 'Lists & List Comprehensions', resource: 'Python Docs' }, { id: 's2', title: 'Tuples and Sets', resource: 'W3Schools' }, { id: 's3', title: 'Dictionaries & JSON', resource: 'Real Python' }, { id: 's4', title: 'String Manipulation', resource: 'Python Docs' }] },
            { id: 'py3', title: 'OOP & Modules', icon: '🔥', color: '#f59e0b', duration: '2 weeks', description: 'Object-Oriented Programming', steps: [{ id: 's1', title: 'Classes and Objects', resource: 'Real Python' }, { id: 's2', title: 'Inheritance & Polymorphism', resource: 'Python Docs' }, { id: 's3', title: 'File Handling (read/write)', resource: 'W3Schools' }, { id: 's4', title: 'Exception Handling', resource: 'Python Docs' }, { id: 's5', title: 'Import Modules & pip', resource: 'PyPI' }] },
            { id: 'py4', title: 'Advanced Python', icon: '💎', color: '#8b5cf6', duration: '2 weeks', description: 'Advanced patterns and libraries', steps: [{ id: 's1', title: 'Decorators and Generators', resource: 'Real Python' }, { id: 's2', title: 'Regular Expressions', resource: 'Regex101' }, { id: 's3', title: 'Working with APIs (requests)', resource: 'Requests Docs' }, { id: 's4', title: 'Virtual Environments & pip', resource: 'Python Docs' }] },
            { id: 'py5', title: 'Projects & Mastery', icon: '🏆', color: '#ef4444', duration: '2 weeks', description: 'Build real-world projects', steps: [{ id: 's1', title: 'CLI To-Do App', resource: 'GitHub' }, { id: 's2', title: 'Web Scraper (BeautifulSoup)', resource: 'bs4 Docs' }, { id: 's3', title: 'REST API with FastAPI/Flask', resource: 'FastAPI Docs' }, { id: 's4', title: 'Publish on GitHub', resource: 'GitHub.com' }] },
        ]
    },
    javascript: {
        title: 'JavaScript Learning Roadmap', description: 'From JS basics to full-stack web development.', estimatedDays: 75,
        stages: [
            { id: 'js1', title: 'JS Fundamentals', icon: '🌱', color: '#f59e0b', duration: '2 weeks', description: 'Core JavaScript concepts', steps: [{ id: 's1', title: 'Variables: var, let, const', resource: 'MDN Docs' }, { id: 's2', title: 'Data Types & Type Coercion', resource: 'JavaScript.info' }, { id: 's3', title: 'Functions & Arrow Functions', resource: 'MDN Docs' }, { id: 's4', title: 'Arrays & Array Methods', resource: 'JavaScript.info' }, { id: 's5', title: 'Objects & Destructuring', resource: 'MDN Docs' }] },
            { id: 'js2', title: 'DOM & Browser APIs', icon: '⚡', color: '#06b6d4', duration: '2 weeks', description: 'Interacting with web pages', steps: [{ id: 's1', title: 'DOM Selection & Manipulation', resource: 'MDN Docs' }, { id: 's2', title: 'Events & Event Listeners', resource: 'JavaScript.info' }, { id: 's3', title: 'Fetch API & AJAX', resource: 'MDN Docs' }, { id: 's4', title: 'LocalStorage & Cookies', resource: 'MDN Docs' }] },
            { id: 'js3', title: 'Async JavaScript', icon: '🔥', color: '#10b981', duration: '1 week', description: 'Asynchronous programming', steps: [{ id: 's1', title: 'Callbacks & Callback Hell', resource: 'JavaScript.info' }, { id: 's2', title: 'Promises (.then/.catch)', resource: 'MDN Docs' }, { id: 's3', title: 'Async/Await', resource: 'JavaScript.info' }, { id: 's4', title: 'Error Handling in Async Code', resource: 'MDN Docs' }] },
            { id: 'js4', title: 'Modern JS & Tooling', icon: '💎', color: '#8b5cf6', duration: '2 weeks', description: 'ES6+ and build tools', steps: [{ id: 's1', title: 'ES6+ Features (Spread, Rest, Optional Chaining)', resource: 'JavaScript.info' }, { id: 's2', title: 'Modules (import/export)', resource: 'MDN Docs' }, { id: 's3', title: 'npm & Package Management', resource: 'npmjs.com' }, { id: 's4', title: 'Vite or Webpack Basics', resource: 'Vite Docs' }] },
            { id: 'js5', title: 'Projects', icon: '🏆', color: '#ef4444', duration: '3 weeks', description: 'Solidify with real projects', steps: [{ id: 's1', title: 'Build a To-Do App', resource: 'GitHub' }, { id: 's2', title: 'Weather App using API', resource: 'OpenWeatherMap' }, { id: 's3', title: 'Quiz Game', resource: 'Vanilla JS' }, { id: 's4', title: 'Portfolio Website', resource: 'GitHub Pages' }] },
        ]
    },
    webdevelopment: {
        title: 'Web Development Roadmap', description: 'Full-stack web developer path from HTML to deployment.', estimatedDays: 120,
        stages: [
            { id: 'wd1', title: 'HTML & CSS Foundations', icon: '🌱', color: '#10b981', duration: '2 weeks', description: 'Structure and style the web', steps: [{ id: 's1', title: 'HTML: Tags, Forms, Semantics', resource: 'MDN HTML' }, { id: 's2', title: 'CSS: Box Model, Flexbox, Grid', resource: 'CSS Tricks' }, { id: 's3', title: 'Responsive Design & Media Queries', resource: 'MDN CSS' }, { id: 's4', title: 'CSS Variables & Animations', resource: 'CSS Tricks' }] },
            { id: 'wd2', title: 'JavaScript & DOM', icon: '⚡', color: '#f59e0b', duration: '3 weeks', description: 'Dynamic interactive web pages', steps: [{ id: 's1', title: 'JS Fundamentals (ES6+)', resource: 'JavaScript.info' }, { id: 's2', title: 'DOM Manipulation', resource: 'MDN Docs' }, { id: 's3', title: 'Fetch API / AJAX', resource: 'MDN Docs' }, { id: 's4', title: 'Async/Await & Promises', resource: 'JavaScript.info' }] },
            { id: 'wd3', title: 'Frontend Framework', icon: '🔥', color: '#06b6d4', duration: '4 weeks', description: 'Build apps with React', steps: [{ id: 's1', title: 'React: Components & JSX', resource: 'React Docs' }, { id: 's2', title: 'State & Props (useState, useEffect)', resource: 'React Docs' }, { id: 's3', title: 'React Router DOM', resource: 'React Router Docs' }, { id: 's4', title: 'Axios & API Integration', resource: 'Axios Docs' }, { id: 's5', title: 'Context API or Redux', resource: 'React Docs' }] },
            { id: 'wd4', title: 'Backend & Database', icon: '💎', color: '#8b5cf6', duration: '4 weeks', description: 'Server-side development', steps: [{ id: 's1', title: 'Node.js & Express Basics', resource: 'Express Docs' }, { id: 's2', title: 'REST API Design', resource: 'REST API Tutorial' }, { id: 's3', title: 'MongoDB with Mongoose', resource: 'Mongoose Docs' }, { id: 's4', title: 'Authentication (JWT)', resource: 'JWT.io' }, { id: 's5', title: 'CORS, Middleware & Security', resource: 'Express Docs' }] },
            { id: 'wd5', title: 'Deploy & Beyond', icon: '🏆', color: '#ef4444', duration: '2 weeks', description: 'Ship your application', steps: [{ id: 's1', title: 'Git & GitHub workflow', resource: 'GitHub' }, { id: 's2', title: 'Deploy Frontend on Vercel/Netlify', resource: 'Vercel.com' }, { id: 's3', title: 'Deploy Backend on Render/Railway', resource: 'Render.com' }, { id: 's4', title: 'Domain & HTTPS Setup', resource: 'Cloudflare' }] },
        ]
    },
    react: {
        title: 'React.js Learning Roadmap', description: 'Master React from components to production apps.', estimatedDays: 60,
        stages: [
            { id: 'r1', title: 'React Basics', icon: '🌱', color: '#06b6d4', duration: '2 weeks', description: 'Core React concepts', steps: [{ id: 's1', title: 'JSX & Rendering Elements', resource: 'React Docs' }, { id: 's2', title: 'Functional Components & Props', resource: 'React Docs' }, { id: 's3', title: 'useState Hook', resource: 'React Docs' }, { id: 's4', title: 'useEffect Hook', resource: 'React Docs' }, { id: 's5', title: 'Lists & Keys', resource: 'React Docs' }] },
            { id: 'r2', title: 'Component Patterns', icon: '⚡', color: '#10b981', duration: '2 weeks', description: 'Reusable component design', steps: [{ id: 's1', title: 'Lifting State Up', resource: 'React Docs' }, { id: 's2', title: 'Controlled vs Uncontrolled Forms', resource: 'React Docs' }, { id: 's3', title: 'Custom Hooks', resource: 'React Docs' }, { id: 's4', title: 'Conditional Rendering', resource: 'React Docs' }] },
            { id: 'r3', title: 'State Management', icon: '🔥', color: '#f59e0b', duration: '2 weeks', description: 'Managing complex state', steps: [{ id: 's1', title: 'useContext API', resource: 'React Docs' }, { id: 's2', title: 'useReducer Hook', resource: 'React Docs' }, { id: 's3', title: 'Redux Toolkit (optional)', resource: 'Redux Toolkit Docs' }, { id: 's4', title: 'React Query / SWR', resource: 'TanStack Query' }] },
            { id: 'r4', title: 'Routing & API', icon: '💎', color: '#8b5cf6', duration: '1 week', description: 'Navigation and data fetching', steps: [{ id: 's1', title: 'React Router v6', resource: 'React Router Docs' }, { id: 's2', title: 'Axios with Interceptors', resource: 'Axios Docs' }, { id: 's3', title: 'Protected & Nested Routes', resource: 'React Router Docs' }] },
            { id: 'r5', title: 'Build & Deploy', icon: '🏆', color: '#ef4444', duration: '1 week', description: 'Production-ready React', steps: [{ id: 's1', title: 'Performance: memo, useMemo, useCallback', resource: 'React Docs' }, { id: 's2', title: 'Code Splitting & Lazy Loading', resource: 'React Docs' }, { id: 's3', title: 'Vite Build & Deploy to Vercel', resource: 'Vercel.com' }] },
        ]
    },
    machinelearning: {
        title: 'Machine Learning Roadmap', description: 'Go from ML fundamentals to deploying trained models.', estimatedDays: 120,
        stages: [
            { id: 'ml1', title: 'Math Foundations', icon: '🌱', color: '#10b981', duration: '3 weeks', description: 'Essential math for ML', steps: [{ id: 's1', title: 'Linear Algebra: Vectors & Matrices', resource: 'Khan Academy' }, { id: 's2', title: 'Calculus: Derivatives & Gradients', resource: 'Khan Academy' }, { id: 's3', title: 'Probability & Statistics', resource: 'Khan Academy' }, { id: 's4', title: 'Python with NumPy & Pandas', resource: 'Kaggle Learn' }] },
            { id: 'ml2', title: 'Classical ML', icon: '⚡', color: '#06b6d4', duration: '4 weeks', description: 'Core ML algorithms', steps: [{ id: 's1', title: 'Linear & Logistic Regression', resource: 'Scikit-learn Docs' }, { id: 's2', title: 'Decision Trees & Random Forests', resource: 'Scikit-learn Docs' }, { id: 's3', title: 'K-Means Clustering', resource: 'Scikit-learn Docs' }, { id: 's4', title: 'Model Evaluation (accuracy, F1, ROC)', resource: 'Scikit-learn Docs' }, { id: 's5', title: 'Feature Engineering', resource: 'Kaggle' }] },
            { id: 'ml3', title: 'Deep Learning', icon: '🔥', color: '#f59e0b', duration: '4 weeks', description: 'Neural networks and deep learning', steps: [{ id: 's1', title: 'Neural Networks Basics', resource: '3Blue1Brown YouTube' }, { id: 's2', title: 'TensorFlow or PyTorch Basics', resource: 'PyTorch Docs' }, { id: 's3', title: 'CNNs for Image Classification', resource: 'Fast.ai' }, { id: 's4', title: 'RNNs & LSTMs for Sequences', resource: 'Coursera' }] },
            { id: 'ml4', title: 'Applied ML', icon: '💎', color: '#8b5cf6', duration: '3 weeks', description: 'Real-world applications', steps: [{ id: 's1', title: 'NLP: Text Classification', resource: 'Hugging Face' }, { id: 's2', title: 'Transfer Learning', resource: 'PyTorch Docs' }, { id: 's3', title: 'Model Saving & Loading', resource: 'Scikit-learn' }, { id: 's4', title: 'Hyperparameter Tuning', resource: 'Optuna Docs' }] },
            { id: 'ml5', title: 'Deploy & Competitions', icon: '🏆', color: '#ef4444', duration: '2 weeks', description: 'Ship ML to production', steps: [{ id: 's1', title: 'Flask/FastAPI ML API', resource: 'FastAPI Docs' }, { id: 's2', title: 'Deploy on Hugging Face Spaces', resource: 'HuggingFace.co' }, { id: 's3', title: 'Enter a Kaggle Competition', resource: 'Kaggle.com' }] },
        ]
    },
    datascience: {
        title: 'Data Science Roadmap', description: 'Comprehensive path from data analysis to insights.', estimatedDays: 90,
        stages: [
            { id: 'ds1', title: 'Programming for Data', icon: '🌱', color: '#10b981', duration: '2 weeks', description: 'Python for data work', steps: [{ id: 's1', title: 'Python Basics (if needed)', resource: 'W3Schools' }, { id: 's2', title: 'NumPy: Arrays & Operations', resource: 'NumPy Docs' }, { id: 's3', title: 'Pandas: DataFrames & Wrangling', resource: 'Pandas Docs' }, { id: 's4', title: 'Matplotlib & Seaborn Visualizations', resource: 'Matplotlib Docs' }] },
            { id: 'ds2', title: 'Statistics & Probability', icon: '⚡', color: '#06b6d4', duration: '2 weeks', description: 'Analytical foundations', steps: [{ id: 's1', title: 'Descriptive Statistics', resource: 'Khan Academy' }, { id: 's2', title: 'Probability Distributions', resource: 'StatQuest YouTube' }, { id: 's3', title: 'Hypothesis Testing & p-values', resource: 'Khan Academy' }, { id: 's4', title: 'Correlation & Regression', resource: 'Towards Data Science' }] },
            { id: 'ds3', title: 'Data Analysis', icon: '🔥', color: '#f59e0b', duration: '3 weeks', description: 'Explore and clean data', steps: [{ id: 's1', title: 'Exploratory Data Analysis (EDA)', resource: 'Kaggle' }, { id: 's2', title: 'Data Cleaning & Missing Values', resource: 'Pandas Docs' }, { id: 's3', title: 'Feature Engineering', resource: 'Kaggle' }, { id: 's4', title: 'SQL for Data Analysis', resource: 'Mode Analytics' }] },
            { id: 'ds4', title: 'Machine Learning Basics', icon: '💎', color: '#8b5cf6', duration: '3 weeks', description: 'ML for data science', steps: [{ id: 's1', title: 'Supervised Learning with Scikit-learn', resource: 'Scikit-learn Docs' }, { id: 's2', title: 'Unsupervised Learning', resource: 'Scikit-learn Docs' }, { id: 's3', title: 'Model Evaluation Techniques', resource: 'Kaggle' }] },
            { id: 'ds5', title: 'Portfolio Projects', icon: '🏆', color: '#ef4444', duration: '2 weeks', description: 'Build your DS portfolio', steps: [{ id: 's1', title: 'End-to-end EDA Project on Kaggle', resource: 'Kaggle.com' }, { id: 's2', title: 'Dashboard with Plotly/Dash', resource: 'Plotly Docs' }, { id: 's3', title: 'Publish Notebook on GitHub', resource: 'GitHub.com' }] },
        ]
    },
    cybersecurity: {
        title: 'Cybersecurity Learning Roadmap', description: 'From security fundamentals to ethical hacking and defense.', estimatedDays: 100,
        stages: [
            { id: 'cs1', title: 'Networking Basics', icon: '🌱', color: '#10b981', duration: '2 weeks', description: 'Essential network concepts', steps: [{ id: 's1', title: 'OSI & TCP/IP Models', resource: 'CompTIA Study Guide' }, { id: 's2', title: 'IP Addresses, DNS & DHCP', resource: 'Professor Messer YouTube' }, { id: 's3', title: 'Common Protocols (HTTP, FTP, SSH)', resource: 'CompTIA Network+' }, { id: 's4', title: 'Firewalls & VPNs', resource: 'TryHackMe' }] },
            { id: 'cs2', title: 'Security Fundamentals', icon: '⚡', color: '#06b6d4', duration: '2 weeks', description: 'Core security principles', steps: [{ id: 's1', title: 'CIA Triad (Confidentiality, Integrity, Availability)', resource: 'CompTIA Security+' }, { id: 's2', title: 'Cryptography: Symmetric & Asymmetric', resource: 'Khan Academy' }, { id: 's3', title: 'Authentication & Authorization', resource: 'OWASP' }, { id: 's4', title: 'Common Threats & Attack Vectors', resource: 'OWASP Top 10' }] },
            { id: 'cs3', title: 'Ethical Hacking', icon: '🔥', color: '#f59e0b', duration: '4 weeks', description: 'Penetration testing skills', steps: [{ id: 's1', title: 'Linux for Hacking (Kali Linux)', resource: 'Kali Linux Docs' }, { id: 's2', title: 'Reconnaissance: nmap, OSINT', resource: 'TryHackMe' }, { id: 's3', title: 'Web Vulnerabilities (SQLi, XSS, IDOR)', resource: 'OWASP WebGoat' }, { id: 's4', title: 'Metasploit Framework Basics', resource: 'Metasploit Unleashed' }, { id: 's5', title: 'CTF Challenges', resource: 'HackTheBox' }] },
            { id: 'cs4', title: 'Defensive Security', icon: '💎', color: '#8b5cf6', duration: '3 weeks', description: 'Blue team skills', steps: [{ id: 's1', title: 'SIEM & Log Analysis (Splunk Basics)', resource: 'Splunk Docs' }, { id: 's2', title: 'Incident Response Process', resource: 'SANS Institute' }, { id: 's3', title: 'Vulnerability Scanning (Nessus)', resource: 'Nessus Docs' }, { id: 's4', title: 'Security Hardening Checklists', resource: 'CIS Controls' }] },
            { id: 'cs5', title: 'Certifications & Practice', icon: '🏆', color: '#ef4444', duration: '3 weeks', description: 'Get certified', steps: [{ id: 's1', title: 'CompTIA Security+ Exam Prep', resource: 'Professor Messer' }, { id: 's2', title: 'TryHackMe Learning Paths', resource: 'TryHackMe.com' }, { id: 's3', title: 'HackTheBox Labs', resource: 'HackTheBox.com' }] },
        ]
    },
    sql: {
        title: 'SQL Learning Roadmap', description: 'Master databases and SQL from basics to advanced queries.', estimatedDays: 45,
        stages: [
            { id: 'sql1', title: 'SQL Fundamentals', icon: '🌱', color: '#10b981', duration: '1 week', description: 'Core SQL commands', steps: [{ id: 's1', title: 'What is a Database & RDBMS?', resource: 'W3Schools SQL' }, { id: 's2', title: 'SELECT, FROM, WHERE', resource: 'W3Schools SQL' }, { id: 's3', title: 'INSERT, UPDATE, DELETE', resource: 'W3Schools SQL' }, { id: 's4', title: 'ORDER BY, LIMIT, DISTINCT', resource: 'W3Schools SQL' }] },
            { id: 'sql2', title: 'Joins & Relationships', icon: '⚡', color: '#06b6d4', duration: '1 week', description: 'Multi-table queries', steps: [{ id: 's1', title: 'INNER, LEFT, RIGHT, FULL JOIN', resource: 'Mode Analytics' }, { id: 's2', title: 'Foreign Keys & References', resource: 'W3Schools SQL' }, { id: 's3', title: 'Subqueries & Nested SELECT', resource: 'Mode Analytics' }, { id: 's4', title: 'Self Join', resource: 'GeeksForGeeks' }] },
            { id: 'sql3', title: 'Aggregation & Grouping', icon: '🔥', color: '#f59e0b', duration: '1 week', description: 'Analytical SQL', steps: [{ id: 's1', title: 'GROUP BY & HAVING', resource: 'Mode Analytics' }, { id: 's2', title: 'Aggregate Functions (SUM, COUNT, AVG)', resource: 'W3Schools SQL' }, { id: 's3', title: 'Window Functions (RANK, ROW_NUMBER)', resource: 'Mode Analytics' }, { id: 's4', title: 'CTEs (WITH clause)', resource: 'PostgreSQL Docs' }] },
            { id: 'sql4', title: 'Advanced SQL', icon: '💎', color: '#8b5cf6', duration: '2 weeks', description: 'Production-level database skills', steps: [{ id: 's1', title: 'Indexes & Query Optimization', resource: 'Use The Index Luke' }, { id: 's2', title: 'Stored Procedures & Functions', resource: 'PostgreSQL Docs' }, { id: 's3', title: 'Transactions & ACID Properties', resource: 'PostgreSQL Docs' }, { id: 's4', title: 'Database Normalization (1NF, 2NF, 3NF)', resource: 'DbDesigner' }] },
            { id: 'sql5', title: 'Projects', icon: '🏆', color: '#ef4444', duration: '1 week', description: 'Apply your SQL skills', steps: [{ id: 's1', title: 'Design a Database Schema for a store', resource: 'dbdiagram.io' }, { id: 's2', title: 'Analyze a real dataset on Kaggle with SQL', resource: 'Kaggle.com' }, { id: 's3', title: 'Connect SQL Database to a Node.js App', resource: 'pg or mysql2 npm' }] },
        ]
    },
    mathematics: {
        title: 'Mathematics Learning Roadmap', description: 'Build strong math foundations from arithmetic to calculus.', estimatedDays: 90,
        stages: [
            { id: 'm1', title: 'Arithmetic & Algebra', icon: '🌱', color: '#10b981', duration: '2 weeks', description: 'Number operations and algebra', steps: [{ id: 's1', title: 'Number Systems (Integers, Fractions, Decimals)', resource: 'Khan Academy' }, { id: 's2', title: 'Algebraic Expressions & Equations', resource: 'Khan Academy' }, { id: 's3', title: 'Quadratic Equations', resource: 'Khan Academy' }, { id: 's4', title: 'Inequalities & Absolute Value', resource: 'Khan Academy' }] },
            { id: 'm2', title: 'Geometry & Trigonometry', icon: '⚡', color: '#06b6d4', duration: '2 weeks', description: 'Shapes, angles and trigonometry', steps: [{ id: 's1', title: 'Lines, Angles, Triangles', resource: 'Khan Academy' }, { id: 's2', title: 'Circles, Polygons, Area & Volume', resource: 'Khan Academy' }, { id: 's3', title: 'Trigonometry: sin, cos, tan', resource: 'Khan Academy' }, { id: 's4', title: 'Pythagorean Theorem', resource: 'Khan Academy' }] },
            { id: 'm3', title: 'Statistics & Probability', icon: '🔥', color: '#f59e0b', duration: '2 weeks', description: 'Data and probability', steps: [{ id: 's1', title: 'Mean, Median, Mode, Range', resource: 'Khan Academy' }, { id: 's2', title: 'Probability Basics', resource: 'Khan Academy' }, { id: 's3', title: 'Permutations & Combinations', resource: 'Khan Academy' }, { id: 's4', title: 'Normal Distribution & Std Deviation', resource: 'Khan Academy' }] },
            { id: 'm4', title: 'Calculus', icon: '💎', color: '#8b5cf6', duration: '4 weeks', description: 'Differential and integral calculus', steps: [{ id: 's1', title: 'Limits and Continuity', resource: 'Khan Academy' }, { id: 's2', title: 'Derivatives & Differentiation Rules', resource: 'Khan Academy' }, { id: 's3', title: 'Integration (Antiderivatives)', resource: 'Khan Academy' }, { id: 's4', title: 'Applications: Area Under Curve', resource: 'Khan Academy' }] },
            { id: 'm5', title: 'Practice & Mastery', icon: '🏆', color: '#ef4444', duration: '2 weeks', description: 'Problem solving mastery', steps: [{ id: 's1', title: 'Daily Practice on Khan Academy', resource: 'khanacademy.org' }, { id: 's2', title: 'Past Year Exam Papers', resource: 'School Board' }, { id: 's3', title: 'Math Olympiad Problems', resource: 'Art of Problem Solving' }] },
        ]
    },
    physics: {
        title: 'Physics Learning Roadmap', description: 'Study the laws of nature from mechanics to quantum physics.', estimatedDays: 90,
        stages: [
            { id: 'ph1', title: 'Classical Mechanics', icon: '🌱', color: '#10b981', duration: '3 weeks', description: 'Motion, force and energy', steps: [{ id: 's1', title: "Newton's Laws of Motion", resource: 'Khan Academy Physics' }, { id: 's2', title: 'Kinematics: Displacement, Velocity, Acceleration', resource: 'Khan Academy' }, { id: 's3', title: 'Work, Energy & Power', resource: 'Khan Academy' }, { id: 's4', title: 'Momentum & Collisions', resource: 'Khan Academy' }, { id: 's5', title: 'Circular Motion & Gravitation', resource: 'Khan Academy' }] },
            { id: 'ph2', title: 'Waves & Optics', icon: '⚡', color: '#06b6d4', duration: '2 weeks', description: 'Light, sound and waves', steps: [{ id: 's1', title: 'Wave Properties (Amplitude, Frequency, Period)', resource: 'Khan Academy' }, { id: 's2', title: 'Sound Waves & Doppler Effect', resource: 'Khan Academy' }, { id: 's3', title: 'Light: Reflection & Refraction', resource: 'Khan Academy' }, { id: 's4', title: 'Lenses & Mirrors', resource: 'Khan Academy' }] },
            { id: 'ph3', title: 'Electricity & Magnetism', icon: '🔥', color: '#f59e0b', duration: '3 weeks', description: 'Circuits, fields and magnetism', steps: [{ id: 's1', title: "Coulomb's Law & Electric Field", resource: 'Khan Academy' }, { id: 's2', title: 'Circuits: Ohm\'s Law, Series & Parallel', resource: 'Khan Academy' }, { id: 's3', title: 'Magnetic Fields & Forces', resource: 'Khan Academy' }, { id: 's4', title: "Faraday's Law: Electromagnetic Induction", resource: 'Khan Academy' }] },
            { id: 'ph4', title: 'Thermodynamics', icon: '💎', color: '#8b5cf6', duration: '2 weeks', description: 'Heat and thermodynamics', steps: [{ id: 's1', title: 'Temperature, Heat & Internal Energy', resource: 'Khan Academy' }, { id: 's2', title: 'Laws of Thermodynamics', resource: 'Khan Academy' }, { id: 's3', title: 'Ideal Gas Law & Kinetic Theory', resource: 'Khan Academy' }] },
            { id: 'ph5', title: 'Modern Physics', icon: '🏆', color: '#ef4444', duration: '2 weeks', description: 'Relativity and quantum physics', steps: [{ id: 's1', title: "Special Relativity (Einstein's Theory)", resource: 'Kurzgesagt YouTube' }, { id: 's2', title: 'Photoelectric Effect & Wave-Particle Duality', resource: 'Khan Academy' }, { id: 's3', title: 'Quantum Mechanics Introduction', resource: 'MinutePhysics YouTube' }] },
        ]
    },
    englishgrammar: {
        title: 'English Grammar Learning Roadmap', description: 'Master English from grammar basics to advanced writing.', estimatedDays: 60,
        stages: [
            { id: 'eg1', title: 'Parts of Speech', icon: '🌱', color: '#10b981', duration: '2 weeks', description: 'Building blocks of English', steps: [{ id: 's1', title: 'Nouns: Types & Usage', resource: 'Grammarly Blog' }, { id: 's2', title: 'Pronouns & Antecedents', resource: 'Grammar Book' }, { id: 's3', title: 'Verbs: Tenses & Forms', resource: 'English Grammar.net' }, { id: 's4', title: 'Adjectives, Adverbs, Prepositions', resource: 'Grammarly Blog' }, { id: 's5', title: 'Conjunctions & Interjections', resource: 'Grammar Book' }] },
            { id: 'eg2', title: 'Sentence Structure', icon: '⚡', color: '#06b6d4', duration: '2 weeks', description: 'Building correct sentences', steps: [{ id: 's1', title: 'Subject, Predicate & Object', resource: 'Grammar Book' }, { id: 's2', title: 'Simple, Compound & Complex Sentences', resource: 'Grammarly Blog' }, { id: 's3', title: 'Active vs Passive Voice', resource: 'Grammarly Blog' }, { id: 's4', title: 'Direct & Indirect Speech', resource: 'English Grammar.net' }] },
            { id: 'eg3', title: 'Tenses & Articles', icon: '🔥', color: '#f59e0b', duration: '2 weeks', description: 'Time expression in English', steps: [{ id: 's1', title: 'Present, Past, Future Tenses', resource: 'British Council' }, { id: 's2', title: 'Perfect Tenses (has/have/had)', resource: 'British Council' }, { id: 's3', title: 'Articles: a, an, the', resource: 'Grammarly Blog' }, { id: 's4', title: 'Modal Verbs (can, could, would, should)', resource: 'British Council' }] },
            { id: 'eg4', title: 'Punctuation & Vocabulary', icon: '💎', color: '#8b5cf6', duration: '2 weeks', description: 'Polish your writing', steps: [{ id: 's1', title: 'Commas, Colons & Semicolons', resource: 'Grammarly Blog' }, { id: 's2', title: 'Apostrophes & Quotation Marks', resource: 'Grammarly Blog' }, { id: 's3', title: 'Synonyms, Antonyms & Idioms', resource: 'Vocabulary.com' }, { id: 's4', title: 'Word-Formation: Prefixes & Suffixes', resource: 'Merriam-Webster' }] },
            { id: 'eg5', title: 'Writing & Practice', icon: '🏆', color: '#ef4444', duration: '2 weeks', description: 'Apply your English skills', steps: [{ id: 's1', title: 'Essay Writing: Introduction, Body, Conclusion', resource: 'Purdue OWL' }, { id: 's2', title: 'Email & Letter Writing Formats', resource: 'British Council' }, { id: 's3', title: 'Daily Practice: Grammar Exercises', resource: 'Duolingo / Grammarly' }] },
        ]
    },
    dsa: {
        title: 'DSA Learning Roadmap', description: 'Data Structures and Algorithms from scratch to interview-ready.', estimatedDays: 90,
        stages: [
            { id: 'dsa1', title: 'Basics & Complexity', icon: '🌱', color: '#10b981', duration: '1 week', description: 'Foundations of DSA', steps: [{ id: 's1', title: 'Big O Notation & Time Complexity', resource: 'CS Dojo YouTube' }, { id: 's2', title: 'Arrays and Strings Problems', resource: 'LeetCode Easy' }, { id: 's3', title: 'Recursion Fundamentals', resource: 'Recursion Video' }, { id: 's4', title: 'Basic Math for DSA', resource: 'Khan Academy' }] },
            { id: 'dsa2', title: 'Linear Structures', icon: '⚡', color: '#06b6d4', duration: '2 weeks', description: 'Stack, Queue, LinkedList', steps: [{ id: 's1', title: 'Linked Lists (Singly & Doubly)', resource: 'GeeksForGeeks' }, { id: 's2', title: 'Stacks & Queues', resource: 'GeeksForGeeks' }, { id: 's3', title: 'Sliding Window & Two Pointer', resource: 'NeetCode' }, { id: 's4', title: 'Hashing & HashMaps', resource: 'LeetCode' }] },
            { id: 'dsa3', title: 'Trees & Graphs', icon: '🔥', color: '#f59e0b', duration: '3 weeks', description: 'Non-linear structures', steps: [{ id: 's1', title: 'Binary Trees & BST', resource: 'Visualgo' }, { id: 's2', title: 'Tree Traversals (BFS/DFS)', resource: 'LeetCode' }, { id: 's3', title: 'Heaps & Priority Queues', resource: 'GeeksForGeeks' }, { id: 's4', title: 'Graph Representation & BFS/DFS', resource: 'Visualgo' }, { id: 's5', title: "Dijkstra's Shortest Path", resource: 'CP-Algorithms' }] },
            { id: 'dsa4', title: 'Algorithms', icon: '💎', color: '#8b5cf6', duration: '3 weeks', description: 'Core algorithm paradigms', steps: [{ id: 's1', title: 'Sorting: Merge, Quick, Heap', resource: 'GeeksForGeeks' }, { id: 's2', title: 'Binary Search Patterns', resource: 'NeetCode' }, { id: 's3', title: 'Dynamic Programming (DP)', resource: 'Aditya Verma YouTube' }, { id: 's4', title: 'Greedy Algorithms', resource: 'GeeksForGeeks' }] },
            { id: 'dsa5', title: 'Interview Prep', icon: '🏆', color: '#ef4444', duration: '2 weeks', description: 'Get interview ready', steps: [{ id: 's1', title: 'Solve 50+ LeetCode Problems', resource: 'LeetCode.com' }, { id: 's2', title: 'Mock Interviews on Pramp', resource: 'Pramp.com' }, { id: 's3', title: 'System Design Basics', resource: 'System Design Primer' }] },
        ]
    },
};

// ── Match topic keyword to local roadmap ──────────────────────
const findLocalRoadmap = (topic) => {
    const t = topic.toLowerCase().replace(/[^a-z]/g, '');
    if (t.includes('python')) return LOCAL_ROADMAPS.python;
    if (t.includes('javascript') || t.includes('js')) return LOCAL_ROADMAPS.javascript;
    if (t.includes('webdev') || t.includes('webdevelopment') || t.includes('fullstack') || t.includes('frontend')) return LOCAL_ROADMAPS.webdevelopment;
    if (t.includes('react') || t.includes('reactjs')) return LOCAL_ROADMAPS.react;
    if (t.includes('machinelearning') || t.includes('ml')) return LOCAL_ROADMAPS.machinelearning;
    if (t.includes('datascience') || t.includes('dataanalysis')) return LOCAL_ROADMAPS.datascience;
    if (t.includes('cybersecurity') || t.includes('security') || t.includes('hacking') || t.includes('ethicalhacking')) return LOCAL_ROADMAPS.cybersecurity;
    if (t.includes('sql') || t.includes('database') || t.includes('mysql') || t.includes('postgres')) return LOCAL_ROADMAPS.sql;
    if (t.includes('math') || t.includes('mathematics') || t.includes('maths')) return LOCAL_ROADMAPS.mathematics;
    if (t.includes('physics')) return LOCAL_ROADMAPS.physics;
    if (t.includes('english') || t.includes('grammar') || t.includes('englishgrammar')) return LOCAL_ROADMAPS.englishgrammar;
    if (t.includes('dsa') || t.includes('datastructure') || t.includes('algorithm')) return LOCAL_ROADMAPS.dsa;
    return null;
};

// ── Generate AI Roadmap (only for unknown topics) ─────────────
exports.generateRoadmap = async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic || topic.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'Please provide a valid topic.' });
        }

        // 1. Try local first — instant, no quota
        const local = findLocalRoadmap(topic);
        if (local) {
            console.log(`✅ Serving local roadmap for: "${topic}"`);
            return res.json({ success: true, roadmap: local, topic: topic.trim(), source: 'local' });
        }

        // 2. Call Gemini AI only for unknown topics
        const apiKey = (process.env.GEMINI_API_KEY || '').trim();
        if (!apiKey || apiKey.length < 20) {
            return res.status(500).json({ success: false, message: 'AI API key not configured.' });
        }

        console.log(`🤖 Generating AI roadmap for unknown topic: "${topic}"`);

        const prompt = `You are an expert curriculum designer. Create a learning roadmap for: "${topic.trim()}".

Return ONLY a valid JSON object (no markdown, no extra text):
{
  "title": "${topic.trim()} Learning Roadmap",
  "description": "One sentence description",
  "estimatedDays": 60,
  "stages": [
    {
      "id": "stage_1",
      "title": "Stage Title",
      "icon": "🌱",
      "color": "#10b981",
      "duration": "2 weeks",
      "description": "What to learn",
      "steps": [
        { "id": "s1", "title": "Specific skill/topic", "resource": "Resource hint" }
      ]
    }
  ]
}
Rules: 4-5 stages, 4-6 steps each, practical and actionable. Use emojis for icons. Valid hex colors only.`;

        let text = await callGeminiDirect(prompt, apiKey);
        text = text.trim().replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/i, '').trim();

        const roadmapJson = JSON.parse(text);
        res.json({ success: true, roadmap: roadmapJson, topic: topic.trim(), source: 'AI' });

    } catch (err) {
        console.error('❌ Roadmap generate error:', err.message);
        const code = err.code;
        if (code === 429 || (err.message || '').includes('quota') || (err.message || '').includes('exceed')) {
            return res.status(429).json({ success: false, message: 'AI quota exceeded. Please wait 1 minute and try again.' });
        }
        res.status(500).json({ success: false, message: 'Failed to generate roadmap. Try a popular topic like Python, DSA, or React.' });
    }
};

// ── Existing controllers ──────────────────────────────────────
exports.getRoadmap = async (req, res) => {
    try {
        res.json({ success: true, roadmap: ROADMAP_DATA });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getProgress = async (req, res) => {
    try {
        const progress = await Progress.find({ user: req.user._id });
        res.json({ success: true, progress });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.toggleTopic = async (req, res) => {
    try {
        const { subject, level, topicId } = req.body;
        let progress = await Progress.findOne({ user: req.user._id, subject, level });
        if (!progress) {
            progress = await Progress.create({ user: req.user._id, subject, level, completedTopics: [topicId] });
        } else {
            const idx = progress.completedTopics.indexOf(topicId);
            if (idx === -1) progress.completedTopics.push(topicId);
            else progress.completedTopics.splice(idx, 1);
            await progress.save();
        }
        res.json({ success: true, progress });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
