import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import './RoleSelect.css';

const roles = [
  {
    id: 'teacher',
    emoji: '👨‍🏫',
    title: 'Teacher',
    subtitle: 'Host Mode',
    description: 'Create AI-powered quizzes, review questions before publishing, and monitor students in real-time.',
    color: '#4169E1',
    bg: '#eff4ff',
    features: ['Generate AI quiz questions', 'Review & edit before publish', 'Share quiz code instantly', 'Monitor 40+ students live'],
  },
  {
    id: 'student',
    emoji: '🎓',
    title: 'Student',
    subtitle: 'Learn Mode',
    description: 'Join quizzes using a room code, select your grade and subject, and track your performance.',
    color: '#10b981',
    bg: '#f0fdf4',
    features: ['Join with quiz code', 'Select grade & subject', 'Real-time leaderboard', 'Track your accuracy'],
  },
  {
    id: 'player',
    emoji: '🎮',
    title: 'Quick Play',
    subtitle: 'Play Mode',
    description: 'Jump into a fun AI-generated quiz on any topic. Play solo or challenge friends in real-time.',
    color: '#f59e0b',
    bg: '#fffbeb',
    features: ['Quiz on any topic', 'Multiplayer rooms', 'Speed bonus scoring', 'Global leaderboard'],
  },
];

const RoleSelect = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (roleId) => {
    setSelected(roleId);
    setLoading(true);
    try {
      const { data } = await api.put('/users/role', { role: roleId });
      updateUser(data.user);
      toast.success(`Welcome! 🎉`);
      if (roleId === 'teacher') navigate('/teacher/dashboard');
      else if (roleId === 'student') navigate('/student/setup');
      else navigate('/dashboard');
    } catch {
      toast.error('Failed to set role. Try again.');
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-select-page">
      <div className="role-select-container">

        {/* Header */}
        <div className="role-select-header animate-fadeIn">
          <div className="role-welcome-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="role-avatar-placeholder">{user?.name?.charAt(0)}</div>
            )}
          </div>
          <h1>Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Choose how you want to use QuizMaster AI</p>
        </div>

        {/* Role Cards */}
        <div className="role-cards animate-slideUp">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`role-card ${selected === role.id ? 'selected' : ''}`}
              style={{ '--role-color': role.color, '--role-bg': role.bg }}
              onClick={() => !loading && handleSelect(role.id)}
            >
              <div className="role-card-icon">{role.emoji}</div>
              <div className="role-card-badge">{role.subtitle}</div>
              <h2 className="role-card-title">{role.title}</h2>
              <p className="role-card-desc">{role.description}</p>
              <div className="role-card-divider" />
              <ul className="role-card-features">
                {role.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              <button
                className="role-card-btn"
                disabled={loading}
              >
                {selected === role.id && loading ? (
                  <><div className="spinner spinner-sm" /> Setting up...</>
                ) : (
                  `Continue as ${role.title}`
                )}
              </button>
            </div>
          ))}
        </div>

        <p className="role-change-note">
          You can switch roles anytime from your profile settings
        </p>
      </div>
    </div>
  );
};

export default RoleSelect;