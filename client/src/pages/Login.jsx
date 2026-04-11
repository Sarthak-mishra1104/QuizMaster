/**
 * Login Page - Google OAuth Sign In
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Shield, Cpu, Users, ChevronRight } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { user, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/dashboard');
  }, [user, loading, navigate]);

  const features = [
    { icon: <Cpu size={20} />, title: 'AI-Generated Quizzes', desc: 'Smart questions on any topic' },
    { icon: <Users size={20} />, title: 'Multiplayer Rooms', desc: 'Compete with up to 4 players' },
    { icon: <Shield size={20} />, title: 'PDF Upload', desc: 'Quiz from your own documents' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-bg-decoration" />

      <div className="login-container">
        {/* Left panel */}
        <div className="login-left">
          <div className="login-logo">
            <div className="logo-icon-lg">
              <Zap size={32} fill="white" />
            </div>
            <span>QuizMaster <strong>AI</strong></span>
          </div>

          <h1 className="login-headline">
            Play Smart.<br />
            <span className="login-headline-accent">Quiz Smarter.</span>
          </h1>

          <p className="login-subtext">
            Generate AI-powered quizzes, challenge friends in real-time, and track your progress across topics.
          </p>

          <div className="login-features">
            {features.map((f, i) => (
              <div key={i} className="login-feature">
                <div className="feature-icon">{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '0.95rem' }}>{f.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel - Sign in card */}
        <div className="login-right">
          <div className="login-card animate-slideUp">
            <div className="login-card-header">
              <div className="login-card-icon">
                <Zap size={24} fill="var(--blue-600)" color="var(--blue-600)" />
              </div>
              <h2>Welcome Back</h2>
              <p>Sign in to start playing and competing</p>
            </div>

            <button className="google-btn" onClick={loginWithGoogle}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
              <ChevronRight size={18} />
            </button>

            <div className="divider-text">
              <span>Secure sign-in via Google OAuth</span>
            </div>

            <div className="login-disclaimer">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              Your data is never shared with third parties.
            </div>

            <div className="login-stats">
              <div className="stat-item"><strong>10K+</strong><span>Quizzes</span></div>
              <div className="stat-divider" />
              <div className="stat-item"><strong>50+</strong><span>Topics</span></div>
              <div className="stat-divider" />
              <div className="stat-item"><strong>Real-time</strong><span>Multiplayer</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
