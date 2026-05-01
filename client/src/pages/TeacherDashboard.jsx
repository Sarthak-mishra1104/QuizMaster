import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, BookOpen, Users, Trophy, Clock, ChevronRight } from 'lucide-react';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Quizzes Created', value: user?.stats?.totalGames || 0, icon: <BookOpen size={20} />, color: 'blue' },
    { label: 'Students Hosted', value: user?.stats?.totalWins || 0, icon: <Users size={20} />, color: 'green' },
    { label: 'Total Score', value: (user?.stats?.totalScore || 0).toLocaleString(), icon: <Trophy size={20} />, color: 'gold' },
  ];

  return (
    <div className="page">
      <div className="container">

        {/* Welcome */}
        <div className="teacher-welcome animate-fadeIn">
          <div>
            <div className="section-eyebrow">Teacher Dashboard</div>
            <h1>Welcome, {user?.name?.split(' ')[0]}! 👨‍🏫</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '1.05rem' }}>
              Create AI-powered quizzes and manage your students in real-time.
            </p>
          </div>
          {user?.avatar && (
            <img src={user.avatar} alt={user.name} className="avatar avatar-xl" style={{ border: '3px solid var(--blue-200)' }} />
          )}
        </div>

        {/* Stats */}
        <div className="teacher-stats animate-fadeIn">
          {stats.map((stat, i) => (
            <div key={i} className={`stat-card stat-card-${stat.color}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Actions */}
        <div className="teacher-actions animate-slideUp">
          {/* Create Quiz Card */}
          <div className="teacher-action-card primary" onClick={() => navigate('/teacher/create')}>
            <div className="teacher-action-icon">
              <Plus size={32} />
            </div>
            <div className="teacher-action-content">
              <h2>Create New Quiz</h2>
              <p>Generate AI questions on any topic or upload a PDF. Review and edit before publishing.</p>
              <div className="teacher-action-cta">
                Get Started <ChevronRight size={16} />
              </div>
            </div>
          </div>

          {/* Join existing room */}
          <div className="teacher-action-card secondary" onClick={() => navigate('/dashboard')}>
            <div className="teacher-action-icon secondary">
              <Users size={32} />
            </div>
            <div className="teacher-action-content">
              <h2>Quick Quiz</h2>
              <p>Start a quick multiplayer quiz session with your students right now.</p>
              <div className="teacher-action-cta secondary">
                Start Now <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Quiz History */}
        {user?.quizHistory?.length > 0 && (
          <div className="recent-section animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="section-eyebrow">History</div>
                <h2 className="section-title">Recent Quizzes</h2>
              </div>
            </div>
            <div className="recent-list">
              {[...user.quizHistory].reverse().slice(0, 5).map((game, i) => (
                <div key={i} className="recent-item">
                  <div className="recent-icon">
                    <BookOpen size={16} />
                  </div>
                  <div className="recent-info">
                    <div className="recent-topic">{game.topic || 'Quiz'}</div>
                    <div className="recent-meta">
                      {game.totalQuestions} questions · {game.accuracy}% accuracy
                    </div>
                  </div>
                  <div className="recent-score">
                    <div className="score-value">{game.score}</div>
                    <div className="score-label">pts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;