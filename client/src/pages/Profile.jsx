/**
 * Profile Page - User stats, history, and editable info
 */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User as _User, Edit3, Save, X, Github, Linkedin, Twitter,
  Globe, BookOpen, Trophy, Target, Zap, BarChart2,
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { User as _User, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    socialLinks: {
      github: user?.socialLinks?.github || '',
      linkedin: user?.socialLinks?.linkedin || '',
      twitter: user?.socialLinks?.twitter || '',
      website: user?.socialLinks?.website || '',
    },
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setSocial = (key, val) => setForm(f => ({
    ...f, socialLinks: { ...f.socialLinks, [key]: val },
  }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return; }
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data.user);
      setEditing(false);
      toast.success('Profile updated! ✅');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || '',
      bio: user?.bio || '',
      socialLinks: { ...user?.socialLinks },
    });
    setEditing(false);
  };

  const stats = [
    { label: 'Games Played', value: user?.stats?.totalGames || 0, icon: <BookOpen size={18} />, color: '#4169E1' },
    { label: 'Total Wins', value: user?.stats?.totalWins || 0, icon: <Trophy size={18} />, color: '#f59e0b' },
    { label: 'Total Score', value: (user?.stats?.totalScore || 0).toLocaleString(), icon: <Zap size={18} />, color: '#8b5cf6' },
    { label: 'Avg Accuracy', value: `${user?.stats?.avgAccuracy || 0}%`, icon: <Target size={18} />, color: '#10b981' },
    {
      label: 'Win Rate',
      value: user?.stats?.totalGames > 0
        ? `${Math.round((user.stats.totalWins / user.stats.totalGames) * 100)}%`
        : '0%',
      icon: <BarChart2 size={18} />, color: '#ef4444',
    },
  ];

  const socialIcons = {
    github: <Github size={16} />,
    linkedin: <Linkedin size={16} />,
    twitter: <Twitter size={16} />,
    website: <Globe size={16} />,
  };

  const socialPlaceholders = {
    github: 'https://github.com/username',
    linkedin: 'https://linkedin.com/in/username',
    twitter: 'https://twitter.com/username',
    website: 'https://yourwebsite.com',
  };

  return (
    <div className="page">
      <div className="container-md">
        {/* Profile Header */}
        <div className="profile-header card animate-fadeIn">
          <div className="profile-cover" />
          <div className="profile-info">
            <div className="profile-avatar-wrapper">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="profile-avatar" />
              ) : (
                <div className="profile-avatar placeholder">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="profile-details">
              {editing ? (
                <input
                  className="input profile-name-input"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Your name"
                  maxLength={50}
                />
              ) : (
                <h2 className="profile-name">{user?.name}</h2>
              )}
              <p className="profile-email">{user?.email}</p>
              <div className="profile-badges">
                <span className="badge badge-blue">
                  🎮 {user?.stats?.totalGames || 0} Games
                </span>
                {user?.stats?.totalWins > 0 && (
                  <span className="badge badge-yellow">
                    🏆 {user?.stats?.totalWins} Wins
                  </span>
                )}
              </div>
            </div>

            <div className="profile-actions">
              {editing ? (
                <>
                  <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                    {saving ? <div className="spinner spinner-sm" /> : <Save size={15} />}
                    Save
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={handleCancel}>
                    <X size={15} /> Cancel
                  </button>
                </>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                  <Edit3 size={15} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="profile-bio-section">
            {editing ? (
              <textarea
                className="input"
                value={form.bio}
                onChange={e => set('bio', e.target.value)}
                placeholder="Write a short bio about yourself..."
                maxLength={300}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            ) : (
              <p className="profile-bio">
                {user?.bio || (
                  <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>
                    No bio yet. Click "Edit Profile" to add one.
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Social Links */}
          <div className="social-links">
            {editing ? (
              <div className="social-inputs">
                {Object.entries(socialPlaceholders).map(([key, placeholder]) => (
                  <div key={key} className="input-group" style={{ marginBottom: 10 }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6, textTransform: 'capitalize' }}>
                      {socialIcons[key]} {key}
                    </label>
                    <input
                      className="input"
                      value={form.socialLinks[key]}
                      onChange={e => setSocial(key, e.target.value)}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="social-display">
                {Object.entries(user?.socialLinks || {}).filter(([, v]) => v).map(([key, url]) => (
                  <a key={key} href={url} target="_blank" rel="noreferrer" className="social-link">
                    {socialIcons[key]}
                    <span style={{ textTransform: 'capitalize' }}>{key}</span>
                  </a>
                ))}
                {!Object.values(user?.socialLinks || {}).some(Boolean) && !editing && (
                  <span style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>No social links added yet.</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="profile-stats animate-slideUp">
          {stats.map((stat, i) => (
            <div key={i} className="profile-stat-card" style={{ '--stat-color': stat.color }}>
              <div className="profile-stat-icon">{stat.icon}</div>
              <div className="profile-stat-value">{stat.value}</div>
              <div className="profile-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quiz History */}
        <div className="history-section card animate-fadeIn">
          <div className="history-header">
            <h3>Quiz History</h3>
            <span className="badge badge-gray">{user?.quizHistory?.length || 0} games</span>
          </div>

          {!user?.quizHistory?.length ? (
            <div className="history-empty">
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎮</div>
              <p>No games played yet!</p>
              <button className="btn btn-primary btn-sm mt-4" onClick={() => navigate('/dashboard')}>
                Play Your First Quiz
              </button>
            </div>
          ) : (
            <div className="history-list">
              <div className="history-table-header">
                <span>Topic</span>
                <span>Score</span>
                <span>Accuracy</span>
                <span>Rank</span>
                <span>Date</span>
              </div>
              {[...user.quizHistory].reverse().map((game, i) => (
                <div key={i} className="history-row">
                  <div className="history-topic">
                    <BookOpen size={14} color="var(--blue-500)" />
                    {game.topic || 'Quiz'}
                  </div>
                  <div className="history-score">
                    <Zap size={12} fill="var(--blue-500)" color="var(--blue-500)" />
                    {game.score.toLocaleString()}
                  </div>
                  <div className={`history-accuracy ${game.accuracy >= 70 ? 'good' : game.accuracy >= 40 ? 'ok' : 'poor'}`}>
                    {game.accuracy}%
                  </div>
                  <div className="history-rank">
                    {game.rank === 1 ? '🥇' : game.rank === 2 ? '🥈' : game.rank === 3 ? '🥉' : `#${game.rank}`}
                  </div>
                  <div className="history-date">
                    {new Date(game.playedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
