import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, Trophy, BookOpen, Zap, ChevronRight, Target } from 'lucide-react';
import CreateRoomModal from '../components/game/CreateRoomModal';
import JoinRoomModal from '../components/game/JoinRoomModal';
import './Dashboard.css';

const Dashboard = () => {
  const { user, verify } = useAuth();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  // Refresh user stats every time dashboard loads
  useEffect(() => {
    verify();
  }, []); // eslint-disable-line

  const firstName = user?.name?.split(' ')[0] || 'Player';

  const stats = [
    { label: 'Games Played', value: user?.stats?.totalGames || 0, icon: <BookOpen size={20} />, color: 'blue' },
    { label: 'Total Wins', value: user?.stats?.totalWins || 0, icon: <Trophy size={20} />, color: 'gold' },
    { label: 'Total Score', value: (user?.stats?.totalScore || 0).toLocaleString(), icon: <Zap size={20} />, color: 'purple' },
    { label: 'Avg Accuracy', value: `${user?.stats?.avgAccuracy || 0}%`, icon: <Target size={20} />, color: 'green' },
  ];

  const quickTopics = [
    'DBMS', 'Operating Systems', 'Data Structures',
    'JavaScript', 'Python', 'Machine Learning',
    'Computer Networks', 'Software Engineering',
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="dashboard-welcome animate-fadeIn">
          <div className="welcome-left">
            <div className="section-eyebrow">Ready to play?</div>
            <h1 className="welcome-title">Hello, {firstName}! 👋</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '1.05rem', maxWidth: 480 }}>
              Challenge yourself with AI-generated quizzes or battle friends in real-time multiplayer rooms.
            </p>
          </div>
          {user?.avatar && (
            <img src={user.avatar} alt={user.name} className="avatar avatar-xl welcome-avatar" />
          )}
        </div>

        <div className="stats-grid animate-fadeIn">
          {stats.map((stat, i) => (
            <div key={i} className={`stat-card stat-card-${stat.color}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="action-grid animate-slideUp">
          <div className="action-card action-card-primary" onClick={() => setShowCreate(true)}>
            <div className="action-card-bg" />
            <div className="action-icon-wrapper">
              <Plus size={28} />
            </div>
            <h3>Create Room</h3>
            <p>Host a quiz game. Set questions, difficulty, and invite friends with a unique code.</p>
            <div className="action-cta">
              Get Started <ChevronRight size={16} />
            </div>
          </div>

          <div className="action-card action-card-secondary" onClick={() => setShowJoin(true)}>
            <div className="action-icon-wrapper secondary">
              <Users size={28} />
            </div>
            <h3>Join Room</h3>
            <p>Have a room code? Jump into a game and compete with other players right now.</p>
            <div className="action-cta secondary">
              Enter Code <ChevronRight size={16} />
            </div>
          </div>
        </div>

        <div className="quick-topics animate-fadeIn">
          <div className="section-eyebrow">Popular Topics</div>
          <h2 className="section-title">Quick Start</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>
            Create a solo quiz on any of these topics instantly
          </p>
          <div className="topics-grid">
            {quickTopics.map((topic) => (
              <button
                key={topic}
                className="topic-chip"
                onClick={() => setShowCreate(true)}
              >
                {topic}
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </div>

        {user?.quizHistory?.length > 0 && (
          <div className="recent-section animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="section-eyebrow">Your Journey</div>
                <h2 className="section-title">Recent Games</h2>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile')}>
                View All
              </button>
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
                      Rank #{game.rank} · {game.accuracy}% accuracy
                    </div>
                  </div>
                  <div className="recent-score">
                    <div className="score-value">{game.score.toLocaleString()}</div>
                    <div className="score-label">pts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
      {showJoin && <JoinRoomModal onClose={() => setShowJoin(false)} />}
    </div>
  );
};

export default Dashboard;