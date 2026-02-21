const ROADMAP_DATA = {
    Mathematics: {
        icon: '📐',
        color: '#6366f1',
        levels: {
            Beginner: {
                topics: [
                    { id: 'math-b-1', title: 'Number Systems & Basics' },
                    { id: 'math-b-2', title: 'Addition, Subtraction, Multiplication, Division' },
                    { id: 'math-b-3', title: 'Fractions & Decimals' },
                    { id: 'math-b-4', title: 'Basic Geometry: Shapes & Angles' },
                    { id: 'math-b-5', title: 'Perimeter & Area' },
                    { id: 'math-b-6', title: 'Introduction to Algebra' },
                ],
            },
            Intermediate: {
                topics: [
                    { id: 'math-i-1', title: 'Linear Equations & Inequalities' },
                    { id: 'math-i-2', title: 'Quadratic Equations' },
                    { id: 'math-i-3', title: 'Coordinate Geometry' },
                    { id: 'math-i-4', title: 'Trigonometry Basics' },
                    { id: 'math-i-5', title: 'Statistics: Mean, Median, Mode' },
                    { id: 'math-i-6', title: 'Probability Fundamentals' },
                ],
            },
            Advanced: {
                topics: [
                    { id: 'math-a-1', title: 'Calculus: Limits & Derivatives' },
                    { id: 'math-a-2', title: 'Integration & Applications' },
                    { id: 'math-a-3', title: 'Vectors & Matrices' },
                    { id: 'math-a-4', title: 'Complex Numbers' },
                    { id: 'math-a-5', title: 'Differential Equations' },
                    { id: 'math-a-6', title: 'Advanced Probability & Distributions' },
                ],
            },
            Expert: {
                topics: [
                    { id: 'math-e-1', title: 'Real Analysis' },
                    { id: 'math-e-2', title: 'Abstract Algebra' },
                    { id: 'math-e-3', title: 'Number Theory' },
                    { id: 'math-e-4', title: 'Topology Fundamentals' },
                    { id: 'math-e-5', title: 'Fourier Analysis' },
                    { id: 'math-e-6', title: 'Optimization Theory' },
                ],
            },
        },
    },
    Science: {
        icon: '🔭',
        color: '#10b981',
        levels: {
            Beginner: {
                topics: [
                    { id: 'sci-b-1', title: 'Matter & Its States' },
                    { id: 'sci-b-2', title: 'Force & Motion Basics' },
                    { id: 'sci-b-3', title: 'Light & Sound' },
                    { id: 'sci-b-4', title: 'Basic Chemistry: Atoms & Molecules' },
                    { id: 'sci-b-5', title: 'Life Processes in Plants' },
                    { id: 'sci-b-6', title: 'Human Body Systems' },
                ],
            },
            Intermediate: {
                topics: [
                    { id: 'sci-i-1', title: "Newton's Laws of Motion" },
                    { id: 'sci-i-2', title: 'Work, Energy & Power' },
                    { id: 'sci-i-3', title: 'Chemical Reactions & Equations' },
                    { id: 'sci-i-4', title: 'Acids, Bases & Salts' },
                    { id: 'sci-i-5', title: 'Genetics & Evolution' },
                    { id: 'sci-i-6', title: 'Electricity & Magnetism' },
                ],
            },
            Advanced: {
                topics: [
                    { id: 'sci-a-1', title: 'Waves & Optics' },
                    { id: 'sci-a-2', title: 'Thermodynamics' },
                    { id: 'sci-a-3', title: 'Electrochemistry' },
                    { id: 'sci-a-4', title: 'Modern Physics: Photoelectric Effect' },
                    { id: 'sci-a-5', title: 'Organic Chemistry Fundamentals' },
                    { id: 'sci-a-6', title: 'Biotechnology & Genomics' },
                ],
            },
            Expert: {
                topics: [
                    { id: 'sci-e-1', title: 'Quantum Mechanics' },
                    { id: 'sci-e-2', title: 'Relativity Theory' },
                    { id: 'sci-e-3', title: 'Advanced Organic Chemistry' },
                    { id: 'sci-e-4', title: 'Nuclear Physics' },
                    { id: 'sci-e-5', title: 'Astrophysics & Cosmology' },
                    { id: 'sci-e-6', title: 'Molecular Biology' },
                ],
            },
        },
    },
    Programming: {
        icon: '💻',
        color: '#f59e0b',
        levels: {
            Beginner: {
                topics: [
                    { id: 'prog-b-1', title: 'What is Programming?' },
                    { id: 'prog-b-2', title: 'Variables, Data Types & Operators' },
                    { id: 'prog-b-3', title: 'Control Flow: if/else, loops' },
                    { id: 'prog-b-4', title: 'Functions & Scope' },
                    { id: 'prog-b-5', title: 'Arrays & Strings' },
                    { id: 'prog-b-6', title: 'Basic I/O & Debugging' },
                ],
            },
            Intermediate: {
                topics: [
                    { id: 'prog-i-1', title: 'Object-Oriented Programming' },
                    { id: 'prog-i-2', title: 'Data Structures: Stacks, Queues, Linked Lists' },
                    { id: 'prog-i-3', title: 'Recursion & Backtracking' },
                    { id: 'prog-i-4', title: 'File I/O & Exceptions' },
                    { id: 'prog-i-5', title: 'Git & Version Control' },
                    { id: 'prog-i-6', title: 'REST APIs & JSON' },
                ],
            },
            Advanced: {
                topics: [
                    { id: 'prog-a-1', title: 'Trees, Graphs & Heaps' },
                    { id: 'prog-a-2', title: 'Sorting & Searching Algorithms' },
                    { id: 'prog-a-3', title: 'Dynamic Programming' },
                    { id: 'prog-a-4', title: 'Databases: SQL & NoSQL' },
                    { id: 'prog-a-5', title: 'System Design Basics' },
                    { id: 'prog-a-6', title: 'Authentication & Security' },
                ],
            },
            Expert: {
                topics: [
                    { id: 'prog-e-1', title: 'Distributed Systems' },
                    { id: 'prog-e-2', title: 'Compiler Design' },
                    { id: 'prog-e-3', title: 'Machine Learning Fundamentals' },
                    { id: 'prog-e-4', title: 'DevOps & CI/CD' },
                    { id: 'prog-e-5', title: 'Microservices Architecture' },
                    { id: 'prog-e-6', title: 'Cloud Computing (AWS/GCP/Azure)' },
                ],
            },
        },
    },
    English: {
        icon: '📚',
        color: '#ec4899',
        levels: {
            Beginner: {
                topics: [
                    { id: 'eng-b-1', title: 'Parts of Speech' },
                    { id: 'eng-b-2', title: 'Sentence Structure' },
                    { id: 'eng-b-3', title: 'Reading Comprehension Basics' },
                    { id: 'eng-b-4', title: 'Vocabulary Building' },
                    { id: 'eng-b-5', title: 'Punctuation & Capitalization' },
                    { id: 'eng-b-6', title: 'Writing Simple Paragraphs' },
                ],
            },
            Intermediate: {
                topics: [
                    { id: 'eng-i-1', title: 'Tenses & Verb Forms' },
                    { id: 'eng-i-2', title: 'Essay Writing' },
                    { id: 'eng-i-3', title: 'Comprehension & Inference' },
                    { id: 'eng-i-4', title: 'Idioms & Phrases' },
                    { id: 'eng-i-5', title: 'Letter & Email Writing' },
                    { id: 'eng-i-6', title: 'Synonyms & Antonyms' },
                ],
            },
            Advanced: {
                topics: [
                    { id: 'eng-a-1', title: 'Advanced Grammar & Usage' },
                    { id: 'eng-a-2', title: 'Critical Analysis of Texts' },
                    { id: 'eng-a-3', title: 'Rhetoric & Argumentation' },
                    { id: 'eng-a-4', title: 'Research & Citation' },
                    { id: 'eng-a-5', title: 'Technical Writing' },
                    { id: 'eng-a-6', title: 'Creative Writing Techniques' },
                ],
            },
            Expert: {
                topics: [
                    { id: 'eng-e-1', title: 'Literary Theory & Criticism' },
                    { id: 'eng-e-2', title: 'Shakespeare & Classical Literature' },
                    { id: 'eng-e-3', title: 'Academic Publishing' },
                    { id: 'eng-e-4', title: 'Linguistics Fundamentals' },
                    { id: 'eng-e-5', title: 'Advanced Public Speaking' },
                    { id: 'eng-e-6', title: 'Professional Writing & Communication' },
                ],
            },
        },
    },
    'General Knowledge': {
        icon: '🌍',
        color: '#8b5cf6',
        levels: {
            Beginner: {
                topics: [
                    { id: 'gk-b-1', title: 'World Geography Basics' },
                    { id: 'gk-b-2', title: 'Countries & Capitals' },
                    { id: 'gk-b-3', title: 'Famous Inventions' },
                    { id: 'gk-b-4', title: 'National Symbols' },
                    { id: 'gk-b-5', title: 'Sports & Games' },
                    { id: 'gk-b-6', title: 'Indian History Overview' },
                ],
            },
            Intermediate: {
                topics: [
                    { id: 'gk-i-1', title: 'World History: Major Events' },
                    { id: 'gk-i-2', title: 'Current Affairs & News' },
                    { id: 'gk-i-3', title: 'Indian Constitution & Polity' },
                    { id: 'gk-i-4', title: 'Science & Technology Updates' },
                    { id: 'gk-i-5', title: 'Economics & Business Basics' },
                    { id: 'gk-i-6', title: 'Environment & Ecology' },
                ],
            },
            Advanced: {
                topics: [
                    { id: 'gk-a-1', title: 'International Organizations (UN, WHO, etc.)' },
                    { id: 'gk-a-2', title: 'Awards & Honours' },
                    { id: 'gk-a-3', title: 'Indian Economy & Budget' },
                    { id: 'gk-a-4', title: 'Geography: Landforms & Climate' },
                    { id: 'gk-a-5', title: 'Art, Culture & Heritage' },
                    { id: 'gk-a-6', title: 'Space Exploration & Discoveries' },
                ],
            },
            Expert: {
                topics: [
                    { id: 'gk-e-1', title: 'Geopolitics & International Relations' },
                    { id: 'gk-e-2', title: 'Advanced Indian History' },
                    { id: 'gk-e-3', title: 'Philosophy & Ethics' },
                    { id: 'gk-e-4', title: 'Bioethics & Technology Governance' },
                    { id: 'gk-e-5', title: 'Advanced Economics: Macro & Micro' },
                    { id: 'gk-e-6', title: 'Global Environmental Policy' },
                ],
            },
        },
    },
};

module.exports = ROADMAP_DATA;
