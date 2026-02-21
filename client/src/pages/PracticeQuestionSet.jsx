import React, { useState, useEffect } from 'react';
import { sounds } from '../utils/audio';

/**
 * EduGen Practice Question Set Module
 * Features: Multi-step selection flow, Interactive MCQ Quiz, 
 */
const PracticeQuestionSet = () => {
  // --- STATE ---
  const [step, setStep] = useState(1); // 1: Year, 2: Subject, 3: Sem, 4: Test, 5: Quiz
  const [selection, setSelection] = useState({
    year: '',
    subject: '',
    semester: '',
    test: ''
  });

  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionIndex: selectedOptionIndex }
  const [submitted, setSubmitted] = useState({}); // { questionIndex: boolean }
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState([]);

  // --- DATA ---
  const years = ['BTech 1st Year', 'BTech 2nd Year', 'BTech 3rd Year', 'BTech 4th Year'];

  const subjectsArr = [
    { id: 'math', name: 'Mathematics', icon: '📐' },
    { id: 'phys', name: 'Physics', icon: '🔭' },
    { id: 'beee', name: 'BEEE', icon: '⚡', desc: 'Basic Electrical & Electronics Engineering' },
    { id: 'dsa', name: 'DSA', icon: '💻', desc: 'Data Structures & Algorithms' },
    { id: 'wd', name: 'WD', icon: '🌐', desc: 'Web Development' },
    { id: 'ephys', name: 'Engineering Physics', icon: '🦾' },
    { id: 'eng', name: 'English Communication', icon: '🗣️' }
  ];

  const questionBank = {
    'Mathematics': [
      { q: "What is the derivative of e^x?", options: ["xe^(x-1)", "e^x", "log(x)", "1/x"], correct: 1, explanation: "The derivative of the exponential function e^x is itself." },
      { q: "The value of ∫ sin(x) dx is?", options: ["cos(x)", "-cos(x)", "tan(x)", "init"], correct: 1, explanation: "The integral of sin(x) is -cos(x) + C." },
      { q: "What is the rank of a 3x3 Identity Matrix?", options: ["0", "1", "2", "3"], correct: 3, explanation: "The rank of an identity matrix is equal to its dimension." },
      { q: "If A is a square matrix, then A + A' is?", options: ["Skew-symmetric", "Symmetric", "Identity", "Diagonal"], correct: 1, explanation: "The sum of a matrix and its transpose is always symmetric." },
      { q: "What is the Laplace transform of 1?", options: ["s", "1/s", "s^2", "1/s^2"], correct: 1, explanation: "L{1} = 1/s for s > 0." }
    ],
    'Physics': [
      { q: "What is the SI unit of Force?", options: ["Joule", "Pascal", "Newton", "Watt"], correct: 2, explanation: "Newton (N) is the SI unit of force." },
      { q: "Speed of light in vacuum is approximately?", options: ["3x10^5 m/s", "3x10^8 m/s", "3x10^10 m/s", "3x10^6 m/s"], correct: 1, explanation: "Light travels at ~299,792,458 meters per second." },
      { q: "Who discovered the Electron?", options: ["James Chadwick", "Ernest Rutherford", "J.J. Thomson", "John Dalton"], correct: 2, explanation: "J.J. Thomson discovered the electron in 1897." },
      { q: "The Work-Energy Theorem states that Work done is equal to change in?", options: ["Potential Energy", "Kinetic Energy", "Momentum", "Inertia"], correct: 1, explanation: "W = ΔKE." },
      { q: "A concave lens always forms what type of image?", options: ["Real & Inverted", "Virtual & Erect", "Real & Erect", "Virtual & Inverted"], correct: 1, explanation: "Concave lenses are diverging lenses and always form virtual, erect images." }
    ],
    'BEEE': [
      { q: "Ohm's Law is defined as:", options: ["V = IR", "I = VR", "R = VI", "V = I/R"], correct: 0, explanation: "V = IR where V is voltage, I is current, and R is resistance." },
      { q: "The unit of Capacitance is?", options: ["Henry", "Farad", "Tesla", "Ohm"], correct: 1, explanation: "The Farad (F) is the unit of capacitance." },
      { q: "In a transformer, the frequency of output is ___ the input?", options: ["Double", "Half", "Same as", "Zero"], correct: 2, explanation: "Transformers change voltage/current but maintain frequency." },
      { q: "Which material is a good conductor?", options: ["Glass", "Silicon", "Copper", "Rubber"], correct: 2, explanation: "Copper is widely used for electrical wiring due to high conductivity." },
      { q: "Semiconductors have ___ temperature coefficient of resistance?", options: ["Positive", "Negative", "Zero", "Variable"], correct: 1, explanation: "Resistance decreases as temperature increases for semiconductors." }
    ],
    'DSA': [
      { q: "Time complexity of searching in a Binary Search Tree (average)?", options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"], correct: 1, explanation: "Binary search trees provide O(log n) search time if balanced." },
      { q: "Which data structure follows LIFO?", options: ["Queue", "Stack", "Linked List", "Tree"], correct: 1, explanation: "Stack is Last-In-First-Out." },
      { q: "A queue works on the principle of?", options: ["LIFO", "FILO", "FIFO", "Random access"], correct: 2, explanation: "Queue is First-In-First-Out." },
      { q: "Linked list is considered a ___ data structure?", options: ["Static", "Dynamic", "Linear only", "Non-linear"], correct: 1, explanation: "Linked lists can grow and shrink in size during execution." },
      { q: "Which sorting algorithm is stable?", options: ["Quick Sort", "Merge Sort", "Heap Sort", "Selection Sort"], correct: 1, explanation: "Merge sort preserves the relative order of duplicate elements." }
    ],
    'WD': [
      { q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Multi Language", "Hyper Transfer Makeup Logic", "None"], correct: 0, explanation: "HTML is the standard markup language for web pages." },
      { q: "Which CSS property is used to change font size?", options: ["text-size", "font-style", "font-size", "size"], correct: 2, explanation: "font-size property sets the size of the text." },
      { q: "Which tag is used for an internal style sheet?", options: ["<css>", "<script>", "<style>", "<link>"], correct: 2, explanation: "The <style> tag is used within the <head>." },
      { q: "The 'alt' attribute in <img> tag is for?", options: ["Alignment", "Alternative text", "Altitude", "Animation"], correct: 1, explanation: "Alt text displays if the image fails to load." },
      { q: "JavaScript is a ___ language?", options: ["Server-side only", "Client-side only", "Both", "Compiled"], correct: 2, explanation: "Modern JS runs in browsers (client) and Node.js (server)." }
    ],
    'Engineering Physics': [
      { q: "What is the principle behind Optical Fibers?", options: ["Reflection", "Refraction", "Total Internal Reflection", "Diffraction"], correct: 2, explanation: "TIR allows light to travel long distances through glass fibers." },
      { q: "The Heisenberg Uncertainty Principle relates position and ___?", options: ["Time", "Mass", "Momentum", "Energy"], correct: 2, explanation: "ΔxΔp ≥ h/4π." },
      { q: "Laser stands for Light Amplification by ___ Emission of Radiation?", options: ["Spontaneous", "Stimulated", "Secondary", "Simple"], correct: 1, explanation: "Stimulated emission is the key process in lasers." }
    ],
    'English Communication': [
      { q: "What is a synonym for 'Abundant'?", options: ["Scarce", "Plentiful", "Rare", "Poor"], correct: 1, explanation: "Plentiful means existing in great quantities." },
      { q: "Which of these is a formal greeting?", options: ["Hey", "What's up", "Good Morning", "Hi there"], correct: 2, explanation: "Good Morning is suitable for professional contexts." },
      { q: "Choose the correct spelling:", options: ["Recieve", "Receive", "Receve", "Reseive"], correct: 1, explanation: "'I' before 'E' except after 'C'." }
    ]
  };

  const semesters = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
  const tests = ['Cycle Test 1', 'Cycle Test 2', 'Cycle Test 3', 'Final Practice Test'];

  // --- LOGIC ---
  const selectYear = (year) => { sounds.pop(); setSelection(prev => ({ ...prev, year })); setStep(2); };

  const selectSubject = (subjectName) => {
    sounds.pop();
    setSelection(prev => ({ ...prev, subject: subjectName }));
    const questions = questionBank[subjectName] || questionBank['DSA'];
    setActiveQuestions(questions);
    setStep(3);
  };

  const selectSemester = (semester) => { sounds.pop(); setSelection(prev => ({ ...prev, semester })); setStep(4); };
  const selectTest = (test) => { sounds.pop(); setSelection(prev => ({ ...prev, test })); setStep(5); };

  const goBack = () => { sounds.click(); if (step > 1) setStep(step - 1); };

  const handleOptionSelect = (optionIndex) => {
    if (submitted[currentQuestionIndex]) return;
    sounds.click();
    setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIndex }));
  };

  const submitCurrentAnswer = () => {
    const selected = userAnswers[currentQuestionIndex];
    if (selected === undefined || submitted[currentQuestionIndex]) return;

    if (selected === activeQuestions[currentQuestionIndex].correct) {
      sounds.success();
      setScore(prev => prev + 1);
    } else {
      sounds.error();
    }
    setSubmitted(prev => ({ ...prev, [currentQuestionIndex]: true }));
  };

  const nextQuestion = () => {
    sounds.click();
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizComplete(true);
    }
  };

  const prevQuestion = () => {
    sounds.click();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const restartQuiz = () => {
    sounds.transition();
    setStep(1);
    setSelection({ year: '', subject: '', semester: '', test: '' });
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSubmitted({});
    setScore(0);
    setQuizComplete(false);
    setActiveQuestions([]);
  };


  // --- UI RENDER HELPERS ---
  const renderStep1 = () => (
    <div className="step-fade-in">
      <h2 className="step-title">🎓 Select BTech Year</h2>
      <div className="selection-grid">
        {years.map(y => (
          <button key={y} className="glass-card selection-btn" onClick={() => selectYear(y)}>
            <div className="btn-icon">🎓</div>
            <div className="btn-label">{y}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-fade-in">
      <h2 className="step-title">📘 Select Subject</h2>
      <div className="selection-grid">
        {subjectsArr.map(s => (
          <button key={s.id} className="glass-card selection-btn subject-btn" onClick={() => selectSubject(s.name)}>
            <div className="btn-icon">{s.icon}</div>
            <div className="btn-content">
              <div className="btn-label">{s.name}</div>
              {s.desc && <div className="btn-desc">{s.desc}</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-fade-in">
      <h2 className="step-title">📅 Select Semester</h2>
      <div className="selection-grid-compact">
        {semesters.map(sem => (
          <button key={sem} className="glass-card selection-btn sem-btn" onClick={() => selectSemester(sem)}>
            <div className="btn-label">{sem}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="step-fade-in">
      <h2 className="step-title">🧪 Select Test</h2>
      <div className="selection-grid">
        {tests.map(t => (
          <button key={t} className="glass-card selection-btn" onClick={() => selectTest(t)}>
            <div className="btn-icon">🧪</div>
            <div className="btn-label">{t}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderQuiz = () => {
    const userAns = userAnswers[currentQuestionIndex];
    const isSubmitted = submitted[currentQuestionIndex];

    if (quizComplete) {
      return (
        <div className="quiz-result step-fade-in">
          <div className="result-icon">🎯</div>
          <h2 className="result-title">Practice Complete!</h2>
          <div className="result-score">
            <span>Your Score:</span>
            <strong>{score} / {activeQuestions.length}</strong>
          </div>
          <p className="result-msg">
            {score >= 4 ? "Excellent! You're ready for the exam!" :
              score >= 2 ? "Good job! A bit more practice and you'll be perfect." :
                "Keep studying! Review the topics and try again."}
          </p>
          <button className="neon-btn primary" onClick={restartQuiz}>Restart Practice</button>
        </div>
      );
    }

    return (
      <div className="quiz-container step-fade-in">
        {/* Progress & Score */}
        <div className="quiz-status-bar">
          <div className="status-item">
            <span className="label">Progress:</span>
            <span className="value">{currentQuestionIndex + 1} / {activeQuestions.length}</span>
          </div>
          <div className="status-item">
            <span className="label">Score:</span>
            <span className="value-score">{score}</span>
          </div>
        </div>

        {/* Question */}
        <div className="question-box">
          <span className="q-number">Question {currentQuestionIndex + 1}</span>
          <h3 className="q-text">{activeQuestions[currentQuestionIndex].q}</h3>
        </div>

        {/* Options */}
        <div className="options-list">
          {activeQuestions[currentQuestionIndex].options.map((opt, idx) => {
            const isSelected = userAns === idx;
            const isCorrect = activeQuestions[currentQuestionIndex].correct === idx;
            let optClass = "option-item glass-card";
            if (isSelected) optClass += " selected";
            if (isSubmitted) {
              if (isCorrect) optClass += " correct";
              else if (isSelected) optClass += " incorrect";
            }

            return (
              <button
                key={idx}
                className={optClass}
                onClick={() => handleOptionSelect(idx)}
                disabled={isSubmitted}
              >
                <div className="radio-indicator"></div>
                <span className="opt-text">{opt}</span>
                {isSubmitted && isCorrect && <span className="feedback-icon">✓</span>}
                {isSubmitted && isSelected && !isCorrect && <span className="feedback-icon">✕</span>}
              </button>
            );
          })}
        </div>

        {/* Feedback Area */}
        {isSubmitted && (
          <div className={`explanation-box ${userAns === activeQuestions[currentQuestionIndex].correct ? 'success' : 'error'}`}>
            <strong>{userAns === activeQuestions[currentQuestionIndex].correct ? 'Correct! ' : 'Incorrect. '}</strong>
            {activeQuestions[currentQuestionIndex].explanation}
          </div>
        )}

        {/* Footer Nav */}
        <div className="quiz-footer">
          <button className="nav-icon-btn" onClick={prevQuestion} disabled={currentQuestionIndex === 0}>
            ← Prev
          </button>

          <div className="action-btns">
            {!isSubmitted ? (
              <button
                className="neon-btn primary"
                onClick={submitCurrentAnswer}
                disabled={userAns === undefined}
              >
                Submit Answer
              </button>
            ) : (
              <button className="neon-btn secondary" onClick={nextQuestion}>
                {currentQuestionIndex === activeQuestions.length - 1 ? 'Finish Test' : 'Next Question →'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="practice-module">
      <style>{`
        :root {
          --primary-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          --secondary-gradient: linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%);
          --glass: rgba(255, 255, 255, 0.05);
          --glass-border: rgba(255, 255, 255, 0.1);
          --text-muted: #94a3b8;
        }

        .practice-module {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 20px;
          color: #f8fafc;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .main-heading {
          font-size: 2.8rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 40px;
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .step-container {
          position: relative;
          min-height: 500px;
        }

        .back-nav {
          margin-bottom: 20px;
        }

        .back-btn {
          background: transparent;
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .back-btn:hover {
          background: var(--glass);
          color: #fff;
          border-color: #6366f1;
        }

        .glass-card {
          background: var(--glass);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .step-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 30px;
          text-align: center;
          color: #e2e8f0;
        }

        /* Grids */
        .selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .selection-grid-compact {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 15px;
        }

        .selection-btn {
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
          cursor: pointer;
          color: inherit;
          text-align: center;
        }

        .selection-btn:hover {
          background: rgba(99, 102, 241, 0.1);
          border-color: #6366f1;
          transform: translateY(-5px);
          box-shadow: 0 10px 25px -10px rgba(99, 102, 241, 0.5);
        }

        .subject-btn {
          padding: 20px;
          flex-direction: row;
          text-align: left;
          justify-content: flex-start;
          gap: 20px;
        }

        .btn-icon { font-size: 2.2rem; }
        .btn-label { font-size: 1.1rem; font-weight: 700; }
        .btn-desc { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; }

        .sem-btn { padding: 20px; }

        /* Quiz UI */
        .quiz-container {
          background: var(--glass);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }

        .quiz-status-bar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 35px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--glass-border);
        }

        .status-item { display: flex; align-items: center; gap: 10px; }
        .status-item .label { color: var(--text-muted); font-size: 0.9rem; }
        .status-item .value { font-weight: 800; }
        .value-score { 
          background: var(--primary-gradient);
          padding: 4px 14px;
          border-radius: 20px;
          font-weight: 800;
        }

        .q-number {
          color: #6366f1;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.8rem;
          margin-bottom: 10px;
          display: block;
        }

        .q-text { font-size: 1.5rem; line-height: 1.4; margin-bottom: 30px; }

        .options-list { display: flex; flexDirection: column; gap: 14px; }

        .option-item {
          width: 100%;
          padding: 18px 25px;
          display: flex;
          align-items: center;
          gap: 20px;
          text-align: left;
          cursor: pointer;
          position: relative;
        }

        .option-item:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .option-item.selected {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.1);
        }

        .option-item.correct {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.15);
        }

        .option-item.incorrect {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.15);
        }

        .radio-indicator {
          width: 22px;
          height: 22px;
          border: 2px solid var(--glass-border);
          border-radius: 50%;
          position: relative;
          flex-shrink: 0;
        }

        .selected .radio-indicator { border-color: #6366f1; }
        .selected .radio-indicator::after {
          content: '';
          position: absolute;
          width: 10px;
          height: 10px;
          background: #6366f1;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .feedback-icon { margin-left: auto; font-weight: 900; }
        .correct .feedback-icon { color: #10b981; }
        .incorrect .feedback-icon { color: #ef4444; }

        .explanation-box {
          margin-top: 25px;
          padding: 20px;
          border-radius: 12px;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        .explanation-box.success { background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; }
        .explanation-box.error { background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; }

        .quiz-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 40px;
        }

        /* Buttons */
        .neon-btn {
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: 0.3s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .neon-btn.primary {
          background: var(--primary-gradient);
          color: #fff;
          box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
        }

        .neon-btn.secondary {
          background: var(--secondary-gradient);
          color: #fff;
          box-shadow: 0 4px 15px rgba(45, 212, 191, 0.4);
        }

        .neon-btn:hover { transform: scale(1.05); }
        .neon-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .nav-icon-btn {
          background: transparent;
          border: 1px solid var(--glass-border);
          color: #fff;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
        }

        /* Recommendation Section */
        .recommend-container {
          margin-top: 80px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .recommend-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 30px;
          background: rgba(99, 102, 241, 0.05);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 24px;
        }

        .rec-info h3 { font-size: 1.4rem; margin-bottom: 8px; color: #a5b4fc; }
        .rec-info p { color: var(--text-muted); font-size: 1rem; }

        .link-btn {
          background: #fff;
          color: #000;
          padding: 14px 24px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: 0.3s;
        }

        .link-btn:hover { background: #e2e8f0; transform: translateX(5px); }

        /* Animation */
        .step-fade-in {
          animation: fadeIn 0.5s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Result View */
        .quiz-result {
          text-align: center;
          padding: 40px;
        }
        .result-icon { font-size: 5rem; margin-bottom: 20px; }
        .result-title { font-size: 2.2rem; margin-bottom: 15px; }
        .result-score { 
          margin-bottom: 25px; 
          font-size: 1.4rem; 
          display: flex; 
          flex-direction: column; 
          gap: 8px;
        }
        .result-score strong { font-size: 3rem; color: #6366f1; }
        .result-msg { color: var(--text-muted); margin-bottom: 40px; }

        @media (max-width: 850px) {
          .recommend-card { flex-direction: column; text-align: center; gap: 25px; }
          .selection-grid { grid-template-columns: 1fr; }
          .quiz-container { padding: 25px; }
          .main-heading { font-size: 2rem; }
        }
      `}</style>

      <h1 className="main-heading">📝 Practice Question Set</h1>

      <div className="step-container">
        {step > 1 && step < 5 && (
          <div className="back-nav">
            <button className="back-btn" onClick={goBack}>
              <span>← Go Back</span>
            </button>
          </div>
        )}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderQuiz()}
      </div>

      <div className="recommend-container">
        <div className="recommend-card">
          <div className="rec-info">
            <h3>📄 Previous Year Question Papers (Recommended)</h3>
            <p>Practice with real previous year GIET University exam papers</p>
          </div>
          <a
            href="https://www.giet.edu/examinations/previous-question-papers/"
            target="_blank"
            rel="noopener noreferrer"
            className="link-btn"
          >
            🔗 View Previous Papers
          </a>
        </div>
      </div>
    </div>
  );
};

export default PracticeQuestionSet;
