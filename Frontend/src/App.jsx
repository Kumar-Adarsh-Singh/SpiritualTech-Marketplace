import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import CreatorRoute from './components/common/CreatorRoute';
import HomePage from './pages/HomePage';
import SessionDetailPage from './pages/SessionDetailPage';
import OAuthCallback from './pages/OAuthCallback';
import UserDashboard from './pages/UserDashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import CreateSessionPage from './pages/CreateSessionPage';
import EditSessionPage from './pages/EditSessionPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-bg">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/sessions/:id" element={<SessionDetailPage />} />

            {/* OAuth callbacks */}
            <Route path="/auth/google/callback" element={<OAuthCallback />} />
            <Route path="/auth/github/callback" element={<OAuthCallback />} />

            {/* Protected — any authenticated user */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Protected — Creator only */}
            <Route
              path="/creator/dashboard"
              element={
                <CreatorRoute>
                  <CreatorDashboard />
                </CreatorRoute>
              }
            />
            <Route
              path="/creator/sessions/new"
              element={
                <CreatorRoute>
                  <CreateSessionPage />
                </CreatorRoute>
              }
            />
            <Route
              path="/creator/sessions/:id/edit"
              element={
                <CreatorRoute>
                  <EditSessionPage />
                </CreatorRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
