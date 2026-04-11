/**
 * Navbar - Top navigation bar
 */
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Home, User, LogOut, Menu, X, Zap } from 'lucide-react';
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

  const navLinks = [
    { to: '/dashboard', label: 'Home', icon: <Home size={16} /> },
    { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
    { to: '/about', label: 'About', icon: <User size={16} /> },
  ];
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="navbar-logo">
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
                <span className="hide-mobile" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-700)' }}>
                  {user.name?.split(' ')[0]}
                </span>
              </button>

              {profileOpen && (
                <>
                  <div className="dropdown-backdrop" onClick={() => setProfileOpen(false)} />
                  <div className="dropdown">
                    <div className="dropdown-header">
                      <span style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{user.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{user.email}</span>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                      <User size={15} /> My Profile
                    </Link>
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
        </div>
      )}
    </nav>
  );
};

export default Navbar;
