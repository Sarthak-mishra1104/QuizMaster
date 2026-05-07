import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { Trophy, RotateCcw, Home, ChevronDown, ChevronUp, Target, Zap, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Results.css';

const MEDALS = ['🥇', '🥈', '🥉'];
const RANK_COLORS = ['#f59e0b', '#94a3b8', '#cd7c2f'];
const RANK_BG = ['#fef9c3', '#f1f5f9', '#fdf4ec'];

const Results = () => {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(location.state || null);
 const [showReview, setShowReview] = useState(false);
  const [showPlayAgain, setShowPlayAgain] = useState(false);
  const [replayTopic, setReplayTopic] = useState(data?.topic || '');
  const [replayNum, setReplayNum] = useState(10);
  const [replayDiff, setReplayDiff] = useState('medium');
  const [replayLoading, setReplayLoading] = useState(false);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    if (!data) {
      api.get(`/rooms/${code}/results`)
        .then(res => setData(res.data))
        .catch(() => { toast.error('Could not load results'); navigate('/dashboard'); })
        .finally(() => setLoading(false));
    }
  }, [code, data, navigate]);

const handlePlayAgain = async () => {
    setReplayLoading(true);
    try {
      const roomRes = await api.post('/rooms/create', {
        numQuestions: replayNum,
        difficulty: replayDiff,
        maxPlayers: 4,
        gameMode: 'all-answer',
      });
      const newCode = roomRes.data.room.code;

      await api.post('/quiz/generate/topic', {
        topic: replayTopic.trim(),
        numQuestions: replayNum,
        difficulty: replayDiff,
        roomCode: newCode,
      });

      toast.success('New game ready! 🎉');
      navigate(`/lobby/${newCode}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create game');
    } finally {
      setReplayLoading(false);
    }
  };



  const getSortedRankings = (rankings) => {
    return [...rankings]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.accuracy || 0) - (a.accuracy || 0);
      })
      .map((p, i) => ({ ...p, rank: i + 1 }));
  };

  useEffect(() => {
    if (!data) return;
    const sortedRankings = getSortedRankings(data.rankings || []);
    const myRank = sortedRankings.find(r => r.name === user?.name)?.rank;
    if (myRank === 1) createConfetti();
  }, [data, user]);

  const createConfetti = () => {
    const colors = ['#4169E1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
    for (let i = 0; i < 80; i++) {
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
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!data) return null;

  const { questions = [], topic } = data;
  const sortedRankings = getSortedRankings(data.rankings || []);
  const myResult = sortedRankings.find(r => r.name === user?.name);

  return (
    <div className="page">
      <div className="container-md">

        {/* Header */}
        <div className="results-header animate-bounceIn">
          <div className="results-trophy">
            <Trophy size={40} fill="#f59e0b" color="#f59e0b" />
          </div>
          <h1>Game Over!</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '1.05rem' }}>
            {topic ? `Quiz: ${topic}` : 'Quiz Complete'} · {questions.length} questions
          </p>
        </div>

        {/* My Result Card */}
        {myResult && (
          <div className={`my-result-card animate-slideUp ${myResult.rank === 1 ? 'winner' : ''}`}>
            <div className="my-result-inner">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {myResult.avatar ? (
                  <img src={myResult.avatar} alt={myResult.name} className="avatar avatar-lg" style={{ border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                ) : (
                  <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, var(--blue-400), var(--blue-700))', color: 'white', fontWeight: 800 }}>
                    {myResult.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '1.8rem' }}>{MEDALS[myResult.rank - 1] || `#${myResult.rank}`}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--gray-900)' }}>
                    {myResult.rank === 1 ? '🎉 You Won!' : myResult.rank === 2 ? '🥈 Runner Up!' : `You Ranked #${myResult.rank}`}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--blue-600)' }}>
                    {(myResult.score || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 600 }}>POINTS</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                    {myResult.correctAnswers || 0}/{questions.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 600 }}>CORRECT</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue-500)' }}>
                    {myResult.accuracy || 0}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 600 }}>ACCURACY</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="rankings-card card animate-slideUp">
          <div className="rankings-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={18} color="var(--blue-500)" /> Final Leaderboard
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
              Ranked by points · accuracy
            </span>
          </div>

          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '50px 1fr 100px 100px 100px',
            gap: 8,
            padding: '10px 20px',
            background: 'var(--gray-50)',
            borderBottom: '1px solid var(--gray-200)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--gray-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            <span>Rank</span>
            <span>Player</span>
            <span style={{ textAlign: 'center' }}>Correct</span>
            <span style={{ textAlign: 'center' }}>Accuracy</span>
            <span style={{ textAlign: 'right' }}>Points</span>
          </div>

          <div className="rankings-list">
            {sortedRankings.map((player, i) => (
              <div
                key={i}
                className={`ranking-row ${player.name === user?.name ? 'me' : ''}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 100px 100px 100px',
                  gap: 8,
                  padding: '14px 20px',
                  alignItems: 'center',
                  background: player.name === user?.name ? 'var(--blue-50)' : i < 3 ? RANK_BG[i] : 'white',
                  borderBottom: '1px solid var(--gray-100)',
                  transition: 'background var(--transition)',
                }}
              >
                {/* Rank */}
                <div style={{ textAlign: 'center', fontSize: '1.3rem' }}>
                  {i < 3
                    ? MEDALS[i]
                    : <span style={{ fontWeight: 700, color: 'var(--gray-500)', fontSize: '0.95rem' }}>#{i + 1}</span>
                  }
                </div>

                {/* Player */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {player.avatar ? (
                    <img
                      src={player.avatar}
                      alt={player.name}
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${i < 3 ? RANK_COLORS[i] : 'var(--gray-200)'}`, flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: i < 3 ? RANK_COLORS[i] : 'var(--blue-100)',
                      color: i < 3 ? 'white' : 'var(--blue-700)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '1rem', flexShrink: 0,
                      border: `2px solid ${i < 3 ? RANK_COLORS[i] : 'var(--gray-200)'}`,
                    }}>
                      {player.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '0.95rem' }}>
                      {player.name}
                      {player.name === user?.name && (
                        <span style={{
                          marginLeft: 6, fontSize: '0.7rem', background: 'var(--blue-500)',
                          color: 'white', padding: '2px 6px', borderRadius: '99px', fontWeight: 700,
                        }}>You</span>
                      )}
                    </div>
                    {i === 0 && <div style={{ fontSize: '0.72rem', color: RANK_COLORS[0], fontWeight: 600 }}>👑 Winner</div>}
                  </div>
                </div>

                {/* Correct */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontWeight: 700, fontSize: '0.95rem',
                    color: (player.correctAnswers || 0) > 0 ? 'var(--success)' : 'var(--gray-400)',
                  }}>
                    {player.correctAnswers || 0}/{player.totalQuestions || questions.length}
                  </span>
                </div>

                {/* Accuracy */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontWeight: 700, fontSize: '0.9rem', padding: '3px 10px',
                    borderRadius: '99px',
                    background: (player.accuracy || 0) >= 70 ? 'var(--success-light)' : (player.accuracy || 0) >= 40 ? 'var(--warning-light)' : 'var(--error-light)',
                    color: (player.accuracy || 0) >= 70 ? '#065f46' : (player.accuracy || 0) >= 40 ? '#92400e' : '#991b1b',
                  }}>
                    {player.accuracy || 0}%
                  </span>
                </div>

                {/* Points */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    <Zap size={14} fill="var(--blue-500)" color="var(--blue-500)" />
                    <span style={{ fontWeight: 900, fontSize: '1.1rem', color: i < 3 ? RANK_COLORS[i] : 'var(--blue-700)' }}>
                      {(player.score || 0).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question Review */}
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
                            <span className="review-option-label">{['A', 'B', 'C', 'D'][j]}</span>
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

        {/* Actions */}
        <div className="results-actions animate-fadeIn">
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard')}>
            <Home size={18} /> Back to Home
          </button>
          <button className="btn btn-primary btn-lg" onClick={() => setShowPlayAgain(true)}>
            <RotateCcw size={18} /> Play Again
          </button>
        </div>

        {/* Play Again Modal */}
        {showPlayAgain && (
          <div className="modal-overlay" onClick={() => setShowPlayAgain(false)}>
            <div className="modal animate-slideUp" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">🎮 Play Again</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowPlayAgain(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="input-group" style={{ marginBottom: 20 }}>
                  <label className="input-label">Topic</label>
                  <input
                    className="input"
                    value={replayTopic}
                    onChange={e => setReplayTopic(e.target.value)}
                    placeholder="Enter topic..."
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 20 }}>
                  <label className="input-label">Number of Questions: <strong>{replayNum}</strong></label>
                  <input
                    type="range" min={5} max={30} step={5}
                    value={replayNum}
                    onChange={e => setReplayNum(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--blue-500)' }}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 24 }}>
                  <label className="input-label">Difficulty</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {['easy', 'medium', 'hard', 'mixed'].map(d => (
                      <button
                        key={d}
                        onClick={() => setReplayDiff(d)}
                        style={{
                          padding: '10px',
                          borderRadius: 'var(--radius)',
                          border: replayDiff === d ? '2px solid var(--blue-500)' : '2px solid var(--gray-200)',
                          background: replayDiff === d ? 'var(--blue-50)' : 'white',
                          color: replayDiff === d ? 'var(--blue-700)' : 'var(--gray-600)',
                          fontWeight: 600, cursor: 'pointer',
                          fontFamily: 'var(--font-main)',
                          fontSize: '0.85rem',
                          textTransform: 'capitalize',
                          transition: 'all var(--transition)',
                        }}
                      >
                        {d === 'easy' ? '😊' : d === 'medium' ? '🎯' : d === 'hard' ? '🔥' : '🎲'} {d}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handlePlayAgain}
                  disabled={replayLoading || !replayTopic.trim()}
                >
                  {replayLoading ? (
                    <><div className="spinner spinner-sm" /> Creating game...</>
                  ) : (
                    <><RotateCcw size={18} /> Start New Game</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Results;