/**
 * App.jsx - Main Application Router
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/ui/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import About from './pages/About';
import './index.css';

// Protected route wrapper
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

// Public route - redirect to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
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

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/lobby/:code" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
        <Route path="/game/:code" element={<ProtectedRoute><Game /></ProtectedRoute>} />
        <Route path="/results/:code" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '100vh', gap: 16, padding: 24,
          }}>
            <div style={{ fontSize: '5rem' }}>🎮</div>
            <h1 style={{ fontSize: '2rem' }}>Page Not Found</h1>
            <p style={{ color: 'var(--gray-500)' }}>This page doesn't exist in our quiz universe.</p>
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
              success: {
                iconTheme: { primary: '#10b981', secondary: 'white' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: 'white' },
              },
            }}
          />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
