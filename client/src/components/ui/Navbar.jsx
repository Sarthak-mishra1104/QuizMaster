import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Home, User, LogOut, Menu, X, Zap, BookOpen, GraduationCap, Gamepad2, RefreshCw } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setProfileOpen(false);
  };

  const handleSwitchRole = () => {
    // Reset role and go to role selection
    navigate('/role-select');
    setProfileOpen(false);
  };

  // Different nav links based on role
  const getNavLinks = () => {
    if (!user) return [];

    if (user.role === 'teacher') {
      return [
        { to: '/teacher/dashboard', label: 'Dashboard', icon: <Home size={16} /> },
        { to: '/teacher/create', label: 'Create Quiz', icon: <BookOpen size={16} /> },
        { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
      ];
    }

    if (user.role === 'student') {
      return [
        { to: '/student/dashboard', label: 'Dashboard', icon: <Home size={16} /> },
        { to: '/student/setup', label: 'Quiz Options', icon: <GraduationCap size={16} /> },
        { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
      ];
    }

    // Player / default
    return [
      { to: '/dashboard', label: 'Home', icon: <Home size={16} /> },
      { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
    ];
  };

  const getRoleLabel = () => {
    if (user?.role === 'teacher') return { emoji: '👨‍🏫', label: 'Teacher' };
    if (user?.role === 'student') return { emoji: '🎓', label: 'Student' };
    if (user?.role === 'player') return { emoji: '🎮', label: 'Player' };
    return null;
  };

  const navLinks = getNavLinks();
  const roleInfo = getRoleLabel();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to={user ? (user.role === 'teacher' ? '/teacher/dashboard' : user.role === 'student' ? '/student/dashboard' : '/dashboard') : '/'} className="navbar-logo">
          <div className="logo-icon">
            <Zap size={20} fill="white" />
          </div>
          <span className="logo-text">QuizMaster <span className="logo-ai">AI</span></span>
        </Link>

        {/* Desktop Nav */}
        {user && (
          <div className="navbar-links hide-mobile">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="navbar-right">
          {user ? (
            <div className="profile-wrapper">
              <button
                className="profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="avatar avatar-sm" />
                ) : (
                  <div className="avatar avatar-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hide-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--gray-700)', lineHeight: 1.2 }}>
                    {user.name?.split(' ')[0]}
                  </span>
                  {roleInfo && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', lineHeight: 1.2 }}>
                      {roleInfo.emoji} {roleInfo.label}
                    </span>
                  )}
                </div>
              </button>

              {profileOpen && (
                <>
                  <div className="dropdown-backdrop" onClick={() => setProfileOpen(false)} />
                  <div className="dropdown">
                    <div className="dropdown-header">
                      <span style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{user.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{user.email}</span>
                      {roleInfo && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--blue-600)', fontWeight: 600, marginTop: 2 }}>
                          {roleInfo.emoji} {roleInfo.label} Mode
                        </span>
                      )}
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                      <User size={15} /> My Profile
                    </Link>
                    <button className="dropdown-item" onClick={handleSwitchRole}>
                      <RefreshCw size={15} /> Switch Role
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
          )}

          {/* Mobile menu toggle */}
          {user && (
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {user && menuOpen && (
        <div className="mobile-nav">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav-link ${isActive(link.to) ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.icon} {link.label}
            </Link>
          ))}
          <div style={{ height: 1, background: 'var(--gray-200)', margin: '8px 0' }} />
          <button className="mobile-nav-link" onClick={handleSwitchRole} style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-main)', width: '100%', textAlign: 'left' }}>
            <RefreshCw size={16} /> Switch Role
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;