import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastContainer } from './components/ui';
import LandingPage from './pages/LandingPage';
import CreateMapPage from './pages/CreateMapPage';
import KnowledgeMapPage from './pages/KnowledgeMapPage';
import QuizPage from './pages/QuizPage';
import QuizResultPage from './pages/QuizResultPage';
import DashboardPage from './pages/DashboardPage';
import './styles/app.css';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreateMapPage />} />
        <Route path="/map/:mapId" element={<KnowledgeMapPage />} />
        <Route path="/map/:mapId/quiz" element={<QuizPage />} />
        <Route path="/map/:mapId/quiz-result" element={<QuizResultPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
      <ToastContainer />
    </AppProvider>
  );
}