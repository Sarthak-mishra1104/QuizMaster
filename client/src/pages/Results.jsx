import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Results.css';

const MEDALS = ['🥇', '🥈', '🥉'];

const Results = () => {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(location.state || null);
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    if (!data) {
      api.get(`/rooms/${code}/results`)
        .then(res => setData(res.data))
        .catch(() => { toast.error('Could not load results'); navigate('/dashboard'); })
        .finally(() => setLoading(false));
    }
  }, [code, data, navigate]);

  useEffect(() => {
    if (!data) return;
    const myRank = data.rankings?.find(r => r.name === user?.name)?.rank;
    if (myRank === 1) createConfetti();
  }, [data, user]);

  const createConfetti = () => {
    const colors = ['#4169E1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
    for (let i = 0; i < 60; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        position:fixed; pointer-events:none; z-index:9999;
        width:${6 + Math.random() * 8}px; height:${6 + Math.random() * 8}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        left:${Math.random() * 100}vw; top:-20px;
        animation: confetti-fall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s forwards;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 6000);
    }
  };

  if (loading) {
    return (
      <div className="page flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!data) return null;

  const { rankings = [], questions = [], topic } = data;
  const myResult = rankings.find(r => r.name === user?.name);

  return (
    <div className="page">
      <div className="container-md">
        <div className="results-header animate-bounceIn">
          <div className="results-trophy">
            <Trophy size={40} fill="#f59e0b" color="#f59e0b" />
          </div>
          <h1>Game Over!</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '1.05rem' }}>
            {topic ? `Quiz: ${topic}` : 'Quiz Complete'} · {questions.length} questions
          </p>
        </div>

        {myResult && (
          <div className={`my-result-card animate-slideUp ${myResult.rank === 1 ? 'winner' : ''}`}>
            <div className="my-result-inner">
              <div style={{ fontSize: '2rem' }}>{MEDALS[myResult.rank - 1] || `#${myResult.rank}`}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--gray-900)' }}>
                  {myResult.rank === 1 ? '🎉 You Won!' : myResult.rank === 2 ? 'Runner Up!' : `You Ranked #${myResult.rank}`}
                </div>
                <div style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                  {myResult.correctAnswers}/{questions.length} correct · {myResult.accuracy}% accuracy
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--blue-600)' }}>
                  {(myResult.score || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 600 }}>POINTS</div>
              </div>
            </div>
          </div>
        )}

        <div className="rankings-card card animate-slideUp">
          <div className="rankings-header">
            <h3>Final Rankings</h3>
          </div>
          <div className="rankings-list">
            {rankings.map((player, i) => (
              <div key={i} className={`ranking-row ${player.name === user?.name ? 'me' : ''}`}>
                <div className="rank-medal">
                  {i < 3 ? MEDALS[i] : <span style={{ color: 'var(--gray-400)', fontWeight: 700 }}>#{i + 1}</span>}
                </div>
                <div className="rank-avatar">
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.name} className="avatar avatar-md" />
                  ) : (
                    <div className="avatar avatar-md">{player.name?.charAt(0)}</div>
                  )}
                </div>
                <div className="rank-info">
                  <div className="rank-name">
                    {player.name}
                    {player.name === user?.name && <span className="badge badge-blue" style={{ marginLeft: 8 }}>You</span>}
                  </div>
                  <div className="rank-stats">
                    {player.correctAnswers || 0}/{player.totalQuestions || 0} correct · {player.accuracy || 0}% accuracy
                  </div>
                </div>
                <div className="rank-score">
                  <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--blue-700)' }}>
                    {(player.score || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {questions.length > 0 && (
          <div className="review-section card animate-fadeIn">
            <button className="review-toggle" onClick={() => setShowReview(!showReview)}>
              <span>📝 Review Questions & Answers</span>
              {showReview ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showReview && (
              <div className="review-list">
                {questions.map((q, i) => (
                  <div key={i} className="review-item">
                    <div className="review-q-num">Q{i + 1}</div>
                    <div className="review-content">
                      <div className="review-question">{q.question}</div>
                      <div className="review-options">
                        {q.options.map((opt, j) => (
                          <div key={j} className={`review-option ${j === q.correctAnswer ? 'correct' : ''}`}>
                            <span className="review-option-label">{['A','B','C','D'][j]}</span>
                            {opt}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <div className="review-explanation">💡 {q.explanation}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="results-actions animate-fadeIn">
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard')}>
            <Home size={18} /> Back to Home
          </button>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
            <RotateCcw size={18} /> Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;