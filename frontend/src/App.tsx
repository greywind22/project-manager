import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useToast, ToastContainer } from './shared/components/Toast';
import ProjectsListPage from './features/projects/pages/ProjectsListPage';
import ProjectDetailPage from './features/projects/pages/ProjectDetailPage';

// App is the root component. It sets up:
// - BrowserRouter for client-side routing
// - ToastContainer for app-wide error/success notifications
// - Route definitions

export default function App() {
  const { toasts, addToast } = useToast();

  return (
    <BrowserRouter>
      <ToastContainer toasts={toasts} />
      <div className="min-h-screen bg-white text-gray-900">
        <nav className="border-b border-gray-200 px-6 py-4">
          <a href="/projects" className="text-sm font-semibold text-gray-900">
            Project Manager
          </a>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={<ProjectsListPage addToast={addToast} />} />
            <Route path="/projects/:id" element={<ProjectDetailPage addToast={addToast} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}