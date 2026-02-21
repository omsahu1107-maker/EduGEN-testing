import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from './components/UI';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import FocusDetector from './components/FocusDetector';

// Pages (lazy-loaded for performance)
import { lazy, Suspense } from 'react';
import { Spinner } from './components/UI';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Timetable = lazy(() => import('./pages/Timetable'));
const Roadmap = lazy(() => import('./pages/Roadmap'));
const Chatbot = lazy(() => import('./pages/Chatbot'));
const Goals = lazy(() => import('./pages/Goals'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Reminders = lazy(() => import('./pages/Reminders'));
const LearningVideos = lazy(() => import('./pages/LearningVideos'));
const SyllabusAnalyzer = lazy(() => import('./pages/SyllabusAnalyzer'));
const PracticeQuestionSet = lazy(() => import('./pages/PracticeQuestionSet'));
const DailySpin = lazy(() => import('./pages/DailySpin'));

function Background() {
  return (
    <div className="bg-orbs">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Background />
          <Navbar />
          <ToastContainer />
          <main className="main-content">
            <Suspense fallback={<Spinner />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
                <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
                <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
                <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
                <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
                <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                <Route path="/videos" element={<ProtectedRoute><LearningVideos /></ProtectedRoute>} />
                <Route path="/syllabus" element={<ProtectedRoute><SyllabusAnalyzer /></ProtectedRoute>} />
                <Route path="/practice" element={<ProtectedRoute><PracticeQuestionSet /></ProtectedRoute>} />
                <Route path="/spin" element={<ProtectedRoute><DailySpin /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          {/* Global Focus & Sleep Detector – floating panel visible for logged-in users */}
          <FocusDetector />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
