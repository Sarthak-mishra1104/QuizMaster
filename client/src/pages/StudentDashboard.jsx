import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Trophy, Target, Zap, Hash, ArrowRight } from 'lucide-react';
import JoinRoomModal from '../components/game/JoinRoomModal';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showJoin, setShowJoin] = useState(false);
  const [code, setCode] = useState('');

  const stats = [
    { label: 'Quizzes Played', value: user?.stats?.totalGames || 0, icon: <BookOpen size={20} />, color: 'blue' },
    { label: 'Total Wins', value: user?.stats?.totalWins || 0, icon: <Trophy size={20} />, color: 'gold' },
    { label: 'Total Score', value: (user?.stats?.totalScore || 0).toLocaleString(), icon: <Zap size={20} />, color: 'purple' },
    { label: 'Avg Accuracy', value: `${user?.stats?.avgAccuracy || 0}%`, icon: <Target size={20} />, color: 'green' },
  ];

  const handleJoin = () => {
    if (code.trim().length !== 6) {
      return;
    }
    navigate(`/lobby/${code.toUpperCase()}`);
  };

  return (
    <div className="page">
      <div className="container">

        {/* Welcome */}
        <div className="student-welcome animate-fadeIn">
          <div>
            <div className="section-eyebrow">Student Dashboard</div>
            <h1>Hey, {user?.name?.split(' ')[0]}! 🎓</h1>
            <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
              {user?.grade && <span className="badge badge-blue">📚 {user.grade}</span>}
              {user?.subject && <span className="badge badge-blue">📖 {user.subject}</span>}
            </div>
          </div>
          {user?.avatar && (
            <img src={user.avatar} alt={user.name} className="avatar avatar-xl" style={{ border: '3px solid var(--blue-200)' }} />
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid animate-fadeIn">
          {stats.map((stat, i) => (
            <div key={i} className={`stat-card stat-card-${stat.color}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Join Quiz */}
        <div className="student-join-card animate-slideUp">
          <div className="student-join-left">
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎮</div>
            <h2>Join a Quiz</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: 20 }}>
              Enter the room code shared by your teacher to join the quiz
            </p>
            <div className="join-code-input">
              <Hash size={20} color="var(--gray-400)" />
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                style={{
                  border: 'none', outline: 'none', flex: 1,
                  fontFamily: 'var(--font-mono)', fontSize: '1.1rem',
                  fontWeight: 700, color: 'var(--blue-700)',
                  letterSpacing: '0.1em', background: 'transparent',
                }}
                maxLength={6}
              />
            </div>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleJoin}
              disabled={code.length !== 6}
              style={{ marginTop: 16 }}
            >
              Join Quiz <ArrowRight size={18} />
            </button>
          </div>
          <div className="student-join-right">
            <div className="join-tip">
              <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>💡</div>
              <h3>How to join?</h3>
              <ol style={{ paddingLeft: 20, color: 'var(--gray-600)', fontSize: '0.9rem', lineHeight: 2 }}>
                <li>Ask your teacher for the room code</li>
                <li>Enter the 6-character code above</li>
                <li>Click Join Quiz</li>
                <li>Wait for teacher to start</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Recent History */}
        {user?.quizHistory?.length > 0 && (
          <div className="recent-section animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="section-eyebrow">Your Progress</div>
                <h2 className="section-title">Recent Quizzes</h2>
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

      {showJoin && <JoinRoomModal onClose={() => setShowJoin(false)} />}
    </div>
  );
};

export default StudentDashboard;