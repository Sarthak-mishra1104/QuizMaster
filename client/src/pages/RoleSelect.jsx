/**
 * RoleSelect Page - Choose role after Google login
 */
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
    description: 'Create quizzes, manage students, view live leaderboard and monitor participants in real-time.',
    color: '#4169E1',
    bg: '#eff4ff',
    border: '#bfd4fe',
    features: ['Create AI quizzes', 'Review & edit questions', 'Share quiz code', 'Monitor 40+ students'],
  },
  {
    id: 'student',
    emoji: '🎓',
    title: 'Student',
    subtitle: 'Learn Mode',
    description: 'Join quizzes using a code, select your grade and subject, and compete with classmates.',
    color: '#10b981',
    bg: '#f0fdf4',
    border: '#a7f3d0',
    features: ['Join with quiz code', 'Select grade & subject', 'View leaderboard', 'Track your progress'],
  },
  {
    id: 'player',
    emoji: '🎮',
    title: 'Random Quiz',
    subtitle: 'Play Mode',
    description: 'Jump into a quick AI-generated quiz on any topic. Play solo or with friends for fun!',
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
    features: ['Any topic quiz', 'Multiplayer rooms', 'Speed bonus points', 'Global leaderboard'],
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
      toast.success(`Welcome, ${roleId === 'teacher' ? 'Teacher' : roleId === 'student' ? 'Student' : 'Player'}! 🎉`);

      // Redirect based on role
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
          <p>How would you like to use QuizMaster AI today?</p>
        </div>

        {/* Role Cards */}
        <div className="role-cards animate-slideUp">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`role-card ${selected === role.id ? 'selected' : ''}`}
              style={{
                '--role-color': role.color,
                '--role-bg': role.bg,
                '--role-border': role.border,
              }}
              onClick={() => !loading && handleSelect(role.id)}
            >
              <div className="role-card-emoji">{role.emoji}</div>
              <div className="role-card-badge">{role.subtitle}</div>
              <h2 className="role-card-title">{role.title}</h2>
              <p className="role-card-desc">{role.description}</p>
              <ul className="role-card-features">
                {role.features.map((f, i) => (
                  <li key={i}>✓ {f}</li>
                ))}
              </ul>
              <button
                className="role-card-btn"
                disabled={loading}
                style={{ background: role.color }}
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
          You can change your role anytime from your profile settings.
        </p>
      </div>
    </div>
  );
};

export default RoleSelect;