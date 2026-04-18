import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/ui/Navbar';
import Login from './pages/Login';
import RoleSelect from './pages/RoleSelect';
import Dashboard from './pages/Dashboard';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import About from './pages/About';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', flexDirection: 'column', gap: 16,
      }}>
        <div className="spinner" />
        <p style={{ color: 'var(--gray-500)' }}>Loading...</p>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return children;
  if (!user.role) return <Navigate to="/role-select" replace />;
  return <Navigate to="/dashboard" replace />;
};

// Route that checks if user has selected a role
const RoleRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (!user.role) return <Navigate to="/role-select" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/auth/callback" element={<Login />} />
        <Route path="/about" element={<About />} />

        {/* Role Selection - after login, before dashboard */}
        <Route path="/role-select" element={<ProtectedRoute><RoleSelect /></ProtectedRoute>} />

        {/* Protected - requires role */}
        <Route path="/dashboard" element={<RoleRoute><Dashboard /></RoleRoute>} />
        <Route path="/lobby/:code" element={<RoleRoute><Lobby /></RoleRoute>} />
        <Route path="/game/:code" element={<RoleRoute><Game /></RoleRoute>} />
        <Route path="/results/:code" element={<RoleRoute><Results /></RoleRoute>} />
        <Route path="/leaderboard" element={<RoleRoute><Leaderboard /></RoleRoute>} />
        <Route path="/profile" element={<RoleRoute><Profile /></RoleRoute>} />

        {/* Teacher routes - coming soon */}
        <Route path="/teacher/dashboard" element={<RoleRoute><Dashboard /></RoleRoute>} />

        {/* Student routes - coming soon */}
        <Route path="/student/setup" element={<RoleRoute><Dashboard /></RoleRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '100vh', gap: 16, padding: 24,
          }}>
            <div style={{ fontSize: '5rem' }}>🎮</div>
            <h1 style={{ fontSize: '2rem' }}>Page Not Found</h1>
            <p style={{ color: 'var(--gray-500)' }}>This page doesn't exist.</p>
            <a href="/dashboard" className="btn btn-primary">Back to Home</a>
          </div>
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontSize: '0.9rem',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              },
              success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
              error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
            }}
          />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;