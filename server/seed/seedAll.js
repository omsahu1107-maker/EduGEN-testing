require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');
const User = require('../models/User');

const questions = [
    // ── MATHEMATICS ──────────────────────────────────────────────
    // Easy
    { subject: 'Mathematics', difficulty: 'Easy', question: 'What is 15 × 12?', options: ['168', '180', '175', '160'], answer: 1, xpReward: 10 },
    { subject: 'Mathematics', difficulty: 'Easy', question: 'What is √144?', options: ['11', '12', '13', '14'], answer: 1, xpReward: 10 },
    { subject: 'Mathematics', difficulty: 'Easy', question: 'Solve: 2x + 5 = 13', options: ['x=3', 'x=4', 'x=5', 'x=6'], answer: 1, xpReward: 10 },
    { subject: 'Mathematics', difficulty: 'Easy', question: 'What is 25% of 200?', options: ['25', '40', '50', '75'], answer: 2, xpReward: 10 },
    { subject: 'Mathematics', difficulty: 'Easy', question: 'What is the LCM of 4 and 6?', options: ['8', '10', '12', '24'], answer: 2, xpReward: 10 },
    // Moderate
    { subject: 'Mathematics', difficulty: 'Moderate', question: 'Area of circle with radius 7 cm (π=22/7)?', options: ['154 cm²', '144 cm²', '166 cm²', '132 cm²'], answer: 0, xpReward: 15 },
    { subject: 'Mathematics', difficulty: 'Moderate', question: 'If sin θ = 3/5, what is cos θ?', options: ['4/5', '3/4', '5/3', '5/4'], answer: 0, xpReward: 15 },
    { subject: 'Mathematics', difficulty: 'Moderate', question: 'Solve: x² - 5x + 6 = 0', options: ['x=1,3', 'x=2,3', 'x=2,4', 'x=1,6'], answer: 1, xpReward: 15 },
    { subject: 'Mathematics', difficulty: 'Moderate', question: 'What is log₁₀(1000)?', options: ['2', '3', '4', '10'], answer: 1, xpReward: 15 },
    { subject: 'Mathematics', difficulty: 'Moderate', question: 'Sum of angles in a hexagon?', options: ['540°', '600°', '720°', '900°'], answer: 2, xpReward: 15 },
    // Hard
    { subject: 'Mathematics', difficulty: 'Hard', question: 'Find dy/dx for y = x³ + 3x² − 5x + 2', options: ['3x²+6x−5', '3x²+3x−5', '3x²+6x+2', 'x²+6x−5'], answer: 0, xpReward: 22 },
    { subject: 'Mathematics', difficulty: 'Hard', question: 'det([[1,2],[3,4]]) = ?', options: ['-2', '2', '10', '-10'], answer: 0, xpReward: 22 },
    { subject: 'Mathematics', difficulty: 'Hard', question: '∫x² dx = ?', options: ['x³', 'x³/3 + C', '2x', '3x²'], answer: 1, xpReward: 22 },
    { subject: 'Mathematics', difficulty: 'Hard', question: 'nth term of AP: a=3, d=4; find T₁₀', options: ['39', '40', '43', '45'], answer: 0, xpReward: 22 },
    { subject: 'Mathematics', difficulty: 'Hard', question: 'P(A∪B) = P(A)+P(B)−P(A∩B). If P(A)=0.4, P(B)=0.5, P(A∩B)=0.2, find P(A∪B)', options: ['0.6', '0.7', '0.8', '0.9'], answer: 1, xpReward: 22 },
    // Challenge
    { subject: 'Mathematics', difficulty: 'Challenge', question: 'Sum of infinite GP 1+1/2+1/4+...?', options: ['1.5', '2', '3', '∞'], answer: 1, xpReward: 30 },
    { subject: 'Mathematics', difficulty: 'Challenge', question: 'How many ways to arrange 5 distinct books on a shelf?', options: ['25', '60', '120', '720'], answer: 2, xpReward: 30 },
    { subject: 'Mathematics', difficulty: 'Challenge', question: 'If z = 3+4i, |z| = ?', options: ['5', '7', '1', '25'], answer: 0, xpReward: 30 },
    { subject: 'Mathematics', difficulty: 'Challenge', question: 'Rank of matrix [[1,2,3],[2,4,6],[3,6,9]]?', options: ['3', '2', '1', '0'], answer: 2, xpReward: 30 },
    { subject: 'Mathematics', difficulty: 'Challenge', question: 'Laplace transform of e^(at) is?', options: ['1/(s+a)', '1/(s−a)', 'a/s²', 's/(s²+a²)'], answer: 1, xpReward: 30 },

    // ── SCIENCE ──────────────────────────────────────────────────
    // Easy
    { subject: 'Science', difficulty: 'Easy', question: 'Chemical symbol for water?', options: ['H₂O', 'CO₂', 'NaCl', 'O₂'], answer: 0, xpReward: 10 },
    { subject: 'Science', difficulty: 'Easy', question: 'Which planet is the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], answer: 2, xpReward: 10 },
    { subject: 'Science', difficulty: 'Easy', question: 'Unit of electric current?', options: ['Volt', 'Ohm', 'Watt', 'Ampere'], answer: 3, xpReward: 10 },
    { subject: 'Science', difficulty: 'Easy', question: 'Photosynthesis produces which gas?', options: ['CO₂', 'N₂', 'O₂', 'H₂'], answer: 2, xpReward: 10 },
    { subject: 'Science', difficulty: 'Easy', question: 'Speed of light ≈ ?', options: ['3×10⁸ m/s', '3×10⁶ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'], answer: 0, xpReward: 10 },
    // Moderate
    { subject: 'Science', difficulty: 'Moderate', question: "Newton's 2nd law: F = ?", options: ['mv', 'ma', 'm/a', 'm+a'], answer: 1, xpReward: 15 },
    { subject: 'Science', difficulty: 'Moderate', question: 'pH of pure water?', options: ['5', '6', '7', '8'], answer: 2, xpReward: 15 },
    { subject: 'Science', difficulty: 'Moderate', question: 'Ohm\'s Law: V = ?', options: ['IR', 'I/R', 'I+R', 'I²R'], answer: 0, xpReward: 15 },
    { subject: 'Science', difficulty: 'Moderate', question: 'Atomic number of Carbon?', options: ['5', '6', '7', '8'], answer: 1, xpReward: 15 },
    { subject: 'Science', difficulty: 'Moderate', question: 'Which part of cell contains DNA?', options: ['Cytoplasm', 'Mitochondria', 'Nucleus', 'Ribosome'], answer: 2, xpReward: 15 },
    // Hard
    { subject: 'Science', difficulty: 'Hard', question: 'Photoelectric effect proves light is?', options: ['Wave only', 'Particle only', 'Both wave & particle', 'Neither'], answer: 2, xpReward: 22 },
    { subject: 'Science', difficulty: 'Hard', question: 'In SHM, acceleration is proportional to?', options: ['Velocity', 'Displacement', 'Time', 'Mass'], answer: 1, xpReward: 22 },
    { subject: 'Science', difficulty: 'Hard', question: 'Half-life of a radioactive element is 10 years. After 30 years, fraction remaining?', options: ['1/2', '1/4', '1/8', '1/16'], answer: 2, xpReward: 22 },
    { subject: 'Science', difficulty: 'Hard', question: 'Entropy of an isolated system always?', options: ['Decreases', 'Increases', 'Stays same', 'Oscillates'], answer: 1, xpReward: 22 },
    { subject: 'Science', difficulty: 'Hard', question: 'Which bond is strongest?', options: ['Hydrogen bond', 'Ionic bond', 'Covalent bond', 'Van der Waals'], answer: 2, xpReward: 22 },
    // Challenge
    { subject: 'Science', difficulty: 'Challenge', question: 'Heisenberg Uncertainty Principle states?', options: ['Energy conserved', 'Cannot know position & momentum precisely', 'Light speed constant', 'Entropy increases'], answer: 1, xpReward: 30 },
    { subject: 'Science', difficulty: 'Challenge', question: 'Pauli Exclusion Principle states?', options: ['No two electrons can have same quantum state', 'Electrons repel protons', 'Mass equals energy', 'Light is a wave'], answer: 0, xpReward: 30 },
    { subject: 'Science', difficulty: 'Challenge', question: 'Quantum number NOT used to define orbital?', options: ['n', 'l', 'mₗ', 'mₛ'], answer: 3, xpReward: 30 },
    { subject: 'Science', difficulty: 'Challenge', question: 'de Broglie wavelength λ = ?', options: ['h/mv', 'mv/h', 'hv/m', 'mh/v'], answer: 0, xpReward: 30 },
    { subject: 'Science', difficulty: 'Challenge', question: 'Gibbs free energy: ΔG = ΔH − TΔS. Reaction spontaneous when ΔG is?', options: ['Positive', 'Zero', 'Negative', 'Undefined'], answer: 2, xpReward: 30 },

    // ── PROGRAMMING ──────────────────────────────────────────────
    // Easy
    { subject: 'Programming', difficulty: 'Easy', question: 'Keyword to declare constant in JavaScript?', options: ['let', 'var', 'const', 'static'], answer: 2, xpReward: 10 },
    { subject: 'Programming', difficulty: 'Easy', question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'HighText Machine Language', 'Hyperlink Markup Language', 'HyperText Machine Label'], answer: 0, xpReward: 10 },
    { subject: 'Programming', difficulty: 'Easy', question: 'Which is NOT a programming language?', options: ['Python', 'HTML', 'Java', 'C++'], answer: 1, xpReward: 10 },
    { subject: 'Programming', difficulty: 'Easy', question: 'Output of: console.log(typeof 42)?', options: ['"number"', '"string"', '"integer"', '"float"'], answer: 0, xpReward: 10 },
    { subject: 'Programming', difficulty: 'Easy', question: 'Which symbol is used for single-line comment in Python?', options: ['//', '/* */', '#', '--'], answer: 2, xpReward: 10 },
    // Moderate
    { subject: 'Programming', difficulty: 'Moderate', question: 'Time complexity of binary search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], answer: 2, xpReward: 15 },
    { subject: 'Programming', difficulty: 'Moderate', question: 'HTTP method to update a resource?', options: ['GET', 'POST', 'PUT', 'DELETE'], answer: 2, xpReward: 15 },
    { subject: 'Programming', difficulty: 'Moderate', question: 'Which data structure uses LIFO?', options: ['Queue', 'Stack', 'Tree', 'Graph'], answer: 1, xpReward: 15 },
    { subject: 'Programming', difficulty: 'Moderate', question: 'CSS property to change text color?', options: ['font-color', 'text-color', 'color', 'foreground'], answer: 2, xpReward: 15 },
    { subject: 'Programming', difficulty: 'Moderate', question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Language', 'Sequential Query Language', 'Standard Query Language'], answer: 0, xpReward: 15 },
    // Hard
    { subject: 'Programming', difficulty: 'Hard', question: 'React hook for side effects?', options: ['useState', 'useEffect', 'useContext', 'useRef'], answer: 1, xpReward: 22 },
    { subject: 'Programming', difficulty: 'Hard', question: 'What is a closure in JavaScript?', options: ['A class declaration', 'Function that remembers its outer scope', 'A type of loop', 'An async function'], answer: 1, xpReward: 22 },
    { subject: 'Programming', difficulty: 'Hard', question: 'What does "this" keyword refer to inside an arrow function?', options: ['The arrow function itself', 'The global object always', 'Enclosing lexical scope\'s this', 'undefined'], answer: 2, xpReward: 22 },
    { subject: 'Programming', difficulty: 'Hard', question: 'REST API status code for "Not Found"?', options: ['200', '201', '400', '404'], answer: 3, xpReward: 22 },
    { subject: 'Programming', difficulty: 'Hard', question: 'Which JS method removes last array element?', options: ['shift()', 'pop()', 'splice()', 'slice()'], answer: 1, xpReward: 22 },
    // Challenge
    { subject: 'Programming', difficulty: 'Challenge', question: 'Sorting algorithm with best average O(n log n)?', options: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'], answer: 2, xpReward: 30 },
    { subject: 'Programming', difficulty: 'Challenge', question: 'In Big-O, O(2ⁿ) is considered?', options: ['Polynomial', 'Logarithmic', 'Exponential', 'Linear'], answer: 2, xpReward: 30 },
    { subject: 'Programming', difficulty: 'Challenge', question: 'CAP theorem: which three cannot all hold?', options: ['Consistency, Availability, Partition Tolerance', 'Create, Add, Persist', 'Cache, API, Protocol', 'None of the above'], answer: 0, xpReward: 30 },
    { subject: 'Programming', difficulty: 'Challenge', question: 'Which design pattern ensures one instance of a class?', options: ['Factory', 'Observer', 'Singleton', 'Decorator'], answer: 2, xpReward: 30 },
    { subject: 'Programming', difficulty: 'Challenge', question: 'What is memoization?', options: ['Saving data to disk', 'Caching function results for same inputs', 'Garbage collection', 'Compiling code'], answer: 1, xpReward: 30 },

    // ── ENGLISH ───────────────────────────────────────────────────
    // Easy
    { subject: 'English', difficulty: 'Easy', question: 'Plural of "child"?', options: ['childs', 'children', 'childes', 'child'], answer: 1, xpReward: 10 },
    { subject: 'English', difficulty: 'Easy', question: 'Correct sentence?', options: ['She go to school', 'She goes to school', 'She going to school', 'She gone to school'], answer: 1, xpReward: 10 },
    { subject: 'English', difficulty: 'Easy', question: 'Adjective in "The tall building"?', options: ['The', 'tall', 'building', 'None'], answer: 1, xpReward: 10 },
    { subject: 'English', difficulty: 'Easy', question: 'Opposite of "ancient"?', options: ['Old', 'Modern', 'Historic', 'Past'], answer: 1, xpReward: 10 },
    { subject: 'English', difficulty: 'Easy', question: 'Which is a vowel?', options: ['b', 'c', 'e', 'g'], answer: 2, xpReward: 10 },
    // Moderate
    { subject: 'English', difficulty: 'Moderate', question: 'Synonym of "benevolent"?', options: ['Cruel', 'Kind', 'Strict', 'Lazy'], answer: 1, xpReward: 15 },
    { subject: 'English', difficulty: 'Moderate', question: '"Running fast, he caught the bus." — phrase type?', options: ['Noun phrase', 'Verb phrase', 'Participial phrase', 'Prepositional phrase'], answer: 2, xpReward: 15 },
    { subject: 'English', difficulty: 'Moderate', question: 'Passive voice of "She writes a letter."?', options: ['A letter is written by her', 'A letter was written by her', 'A letter has written by her', 'A letter written by her'], answer: 0, xpReward: 15 },
    { subject: 'English', difficulty: 'Moderate', question: 'Antonym of "verbose"?', options: ['Talkative', 'Wordy', 'Concise', 'Lengthy'], answer: 2, xpReward: 15 },
    { subject: 'English', difficulty: 'Moderate', question: 'Which tense: "I have been studying for 2 hours"?', options: ['Simple Present', 'Past Perfect', 'Present Perfect Continuous', 'Future Perfect'], answer: 2, xpReward: 15 },
    // Hard
    { subject: 'English', difficulty: 'Hard', question: '"A stitch in time saves nine" is an example of?', options: ['Metaphor', 'Simile', 'Proverb', 'Oxymoron'], answer: 2, xpReward: 22 },
    { subject: 'English', difficulty: 'Hard', question: 'Figure of speech: "The sun smiled down on us."', options: ['Simile', 'Metaphor', 'Personification', 'Alliteration'], answer: 2, xpReward: 22 },
    { subject: 'English', difficulty: 'Hard', question: '"Deafening silence" is an example of?', options: ['Simile', 'Hyperbole', 'Oxymoron', 'Metaphor'], answer: 2, xpReward: 22 },
    { subject: 'English', difficulty: 'Hard', question: 'Which sentence uses the subjunctive mood?', options: ['If I was rich, I would travel', 'If I were rich, I would travel', 'If I am rich, I will travel', 'If I be rich, I travel'], answer: 1, xpReward: 22 },
    { subject: 'English', difficulty: 'Hard', question: 'The word "euphemism" means?', options: ['A harsh statement', 'A mild/indirect expression', 'An exaggeration', 'A contradiction'], answer: 1, xpReward: 22 },
    // Challenge
    { subject: 'English', difficulty: 'Challenge', question: '"To be or not to be" — rhetorical device?', options: ['Anaphora', 'Antithesis', 'Alliteration', 'Epistrophe'], answer: 1, xpReward: 30 },
    { subject: 'English', difficulty: 'Challenge', question: 'Which is a dangling modifier?', options: ['Walking to school, my bag was heavy.', 'She studied hard and passed.', 'He ran quickly.', 'They are friends.'], answer: 0, xpReward: 30 },
    { subject: 'English', difficulty: 'Challenge', question: 'Correct indirect speech: He said "I am happy"?', options: ['He said that he is happy', 'He said that he was happy', 'He said that I was happy', 'He told that he was happy'], answer: 1, xpReward: 30 },
    { subject: 'English', difficulty: 'Challenge', question: '"Bildungsroman" refers to?', options: ['Horror genre', 'A coming-of-age novel', 'A political satire', 'A detective story'], answer: 1, xpReward: 30 },
    { subject: 'English', difficulty: 'Challenge', question: 'Which literary term describes narrator\'s unreliability?', options: ['Omniscient narrator', 'Unreliable narrator', 'Third-person narrator', 'Stream of consciousness'], answer: 1, xpReward: 30 },

    // ── GENERAL KNOWLEDGE ─────────────────────────────────────────
    // Easy
    { subject: 'General Knowledge', difficulty: 'Easy', question: 'Capital of India?', options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'], answer: 1, xpReward: 10 },
    { subject: 'General Knowledge', difficulty: 'Easy', question: 'Days in a leap year?', options: ['365', '366', '364', '367'], answer: 1, xpReward: 10 },
    { subject: 'General Knowledge', difficulty: 'Easy', question: 'Who wrote India\'s national anthem?', options: ['Mahatma Gandhi', 'Rabindranath Tagore', 'Subhas Chandra Bose', 'Nehru'], answer: 1, xpReward: 10 },
    { subject: 'General Knowledge', difficulty: 'Easy', question: 'Largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], answer: 3, xpReward: 10 },
    { subject: 'General Knowledge', difficulty: 'Easy', question: 'How many sides does a pentagon have?', options: ['4', '5', '6', '7'], answer: 1, xpReward: 10 },
    // Moderate
    { subject: 'General Knowledge', difficulty: 'Moderate', question: 'Smallest planet in our solar system?', options: ['Venus', 'Mars', 'Mercury', 'Pluto'], answer: 2, xpReward: 15 },
    { subject: 'General Knowledge', difficulty: 'Moderate', question: 'India\'s independence year?', options: ['1945', '1947', '1950', '1942'], answer: 1, xpReward: 15 },
    { subject: 'General Knowledge', difficulty: 'Moderate', question: 'Currency of Japan?', options: ['Won', 'Yuan', 'Yen', 'Ringgit'], answer: 2, xpReward: 15 },
    { subject: 'General Knowledge', difficulty: 'Moderate', question: 'Which gas is most abundant in Earth\'s atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], answer: 2, xpReward: 15 },
    { subject: 'General Knowledge', difficulty: 'Moderate', question: 'Headquarter of United Nations?', options: ['Geneva', 'London', 'New York', 'Paris'], answer: 2, xpReward: 15 },
    // Hard
    { subject: 'General Knowledge', difficulty: 'Hard', question: 'Article of Indian Constitution for Right to Education?', options: ['Article 19', 'Article 21A', 'Article 32', 'Article 44'], answer: 1, xpReward: 22 },
    { subject: 'General Knowledge', difficulty: 'Hard', question: 'Which country has the longest coastline?', options: ['USA', 'Russia', 'Australia', 'Canada'], answer: 3, xpReward: 22 },
    { subject: 'General Knowledge', difficulty: 'Hard', question: 'First country to give women the right to vote?', options: ['USA', 'UK', 'New Zealand', 'France'], answer: 2, xpReward: 22 },
    { subject: 'General Knowledge', difficulty: 'Hard', question: 'ISRO\'s first satellite was?', options: ['Aryabhata', 'Rohini', 'Bhaskara', 'INSAT-1A'], answer: 0, xpReward: 22 },
    { subject: 'General Knowledge', difficulty: 'Hard', question: 'Which programming language was created by Guido van Rossum?', options: ['Java', 'Ruby', 'Python', 'PHP'], answer: 2, xpReward: 22 },
    // Challenge
    { subject: 'General Knowledge', difficulty: 'Challenge', question: 'Kyoto Protocol relates to?', options: ['Nuclear disarmament', 'Greenhouse gas emissions', 'Trade agreements', 'Human rights'], answer: 1, xpReward: 30 },
    { subject: 'General Knowledge', difficulty: 'Challenge', question: 'Which organisation publishes Human Development Index?', options: ['World Bank', 'IMF', 'UNDP', 'WHO'], answer: 2, xpReward: 30 },
    { subject: 'General Knowledge', difficulty: 'Challenge', question: 'Which country uses the most renewable energy (% of total)?', options: ['Germany', 'China', 'Iceland', 'USA'], answer: 2, xpReward: 30 },
    { subject: 'General Knowledge', difficulty: 'Challenge', question: 'What is the Chandrayaan-3 lander called?', options: ['Pragyan', 'Vikram', 'Shiv Shakti', 'Mangalyaan'], answer: 1, xpReward: 30 },
    { subject: 'General Knowledge', difficulty: 'Challenge', question: 'Which treaty established the European Union?', options: ['Treaty of Rome', 'Treaty of Paris', 'Maastricht Treaty', 'Lisbon Treaty'], answer: 2, xpReward: 30 },
];

async function seedAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Seed questions
        await Question.deleteMany({});
        await Question.insertMany(questions);
        console.log(`✅ Seeded ${questions.length} questions (5 per subject × difficulty)`);

        // 3. Create Admin
        const adminExists = await User.findOne({ email: 'admin@edugen.com' });
        if (!adminExists) {
            await User.create({ name: 'EduGEN Admin', email: 'admin@edugen.com', password: 'Admin@123', role: 'admin', xp: 9999, level: 'Expert', streak: 100 });
            console.log('✅ Admin: admin@edugen.com / Admin@123');
        }

        // 4. Create Demo Student
        const demoExists = await User.findOne({ email: 'demo@edugen.com' });
        if (!demoExists) {
            await User.create({ name: 'Demo Student', email: 'demo@edugen.com', password: 'Demo@123', role: 'student', xp: 750, level: 'Intermediate', streak: 7, totalStudyHours: 24 });
            console.log('✅ Demo: demo@edugen.com / Demo@123');
        }
        else {
            console.log('ℹ️  Demo student already exists');
        }

        console.log('🎉 Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        process.exit(1);
    }
}

seedAll();
