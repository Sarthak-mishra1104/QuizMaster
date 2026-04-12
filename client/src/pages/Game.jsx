import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Users, Zap, SkipForward, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './Game.css';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_COLORS = ['#4169E1', '#7c3aed', '#f59e0b', '#10b981'];

const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'correct') {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
    } else if (type === 'wrong') {
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.2);
    } else if (type === 'tick') {
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
    }
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
};

const Game = () => {
  const { code } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState({
    phase: 'waiting',
    currentQuestion: null,
    questionIndex: 0,
    totalQuestions: 0,
    timeLeft: 30,
    scores: [],
    selectedOption: null,
    result: null,
    isHost: false,
    settings: {},
  });

  const timerRef = useRef(null);
  const revealTimerRef = useRef(null);

  const startTimer = useCallback((duration) => {
    if (timerRef.current) clearInterval(timerRef.current);
    let t = duration;
    setGameState(prev => ({ ...prev, timeLeft: t }));
    timerRef.current = setInterval(() => {
      t--;
      setGameState(prev => ({ ...prev, timeLeft: t }));
      if (t <= 5 && t > 0) playSound('tick');
      if (t <= 0) clearInterval(timerRef.current);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-room', { roomCode: code }, (res) => {
      if (res?.error) {
        toast.error(res.error);
        navigate('/dashboard');
        return;
      }
      const me = res?.room?.players?.find(p => p.userId === user?._id);
      setGameState(prev => ({
        ...prev,
        isHost: me?.isHost || false,
        totalQuestions: res?.room?.questionCount || 0,
        settings: res?.room?.settings || {},
        scores: res?.room?.players?.map(p => ({
          name: p.name, avatar: p.avatar, score: p.score, userId: p.userId
        })) || [],
      }));
    });

    socket.on('question-start', ({ index, total, question, options, difficulty, timeLimit, currentTurnPlayer }) => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);

      setGameState(prev => ({
        ...prev,
        phase: 'question',
        currentQuestion: { question, options, difficulty, currentTurnPlayer },
        questionIndex: index,
        totalQuestions: total,
        selectedOption: null,
        result: null,
        timeLeft: timeLimit,
      }));
      startTimer(timeLimit);
    });

    socket.on('question-timeout', ({ correctAnswer, explanation }) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState(prev => ({
        ...prev,
        phase: 'reveal',
        result: {
          correctAnswer,
          explanation,
          isCorrect: prev.selectedOption === correctAnswer,
          pointsEarned: 0
        },
      }));
    });

    socket.on('score-update', ({ scores }) => {
      setGameState(prev => ({ ...prev, scores }));
    });

    socket.on('chat-message', ({ name, message }) => {
      toast(`${name}: ${message}`, { icon: '💬', duration: 3000 });
    });

    socket.on('player-left', ({ name }) => {
      toast(`${name} disconnected`, { icon: '👋', duration: 2000 });
    });

    socket.on('game-finished', (data) => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      navigate(`/results/${code}`, { state: data });
    });

    return () => {
      socket.off('question-start');
      socket.off('question-timeout');
      socket.off('score-update');
      socket.off('chat-message');
      socket.off('player-left');
      socket.off('game-finished');
      if (timerRef.current) clearInterval(timerRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, [socket, code, navigate, user, startTimer]);

  const handleAnswer = (optionIndex) => {
    if (gameState.selectedOption !== null || gameState.phase !== 'question') return;

    // Stop timer immediately
    clearInterval(timerRef.current);
    setGameState(prev => ({ ...prev, selectedOption: optionIndex }));

    socket.emit('submit-answer', {
      roomCode: code,
      questionIndex: gameState.questionIndex,
      selectedOption: optionIndex,
      timeTaken: (gameState.settings?.timePerQuestion || 30) - gameState.timeLeft,
    }, (res) => {
      if (res?.error) return;

      playSound(res.isCorrect ? 'correct' : 'wrong');

      // Show result immediately
      setGameState(prev => ({ ...prev, phase: 'reveal', result: res }));

      // Auto advance to waiting screen after 1.5 seconds
      revealTimerRef.current = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          phase: 'answered',
          currentQuestion: prev.currentQuestion,
        }));
      }, 1500);
    });
  };

  const handleSkip = () => socket.emit('skip-question', { roomCode: code });

  const handleEndGame = () => {
    if (window.confirm('End the game now?')) socket.emit('end-game', { roomCode: code });
  };

  const {
    phase, currentQuestion, questionIndex, totalQuestions,
    timeLeft, scores, selectedOption, result, isHost, settings
  } = gameState;

  const progress = totalQuestions ? ((questionIndex + 1) / totalQuestions) * 100 : 0;
  const timerPercent = settings.timePerQuestion ? (timeLeft / settings.timePerQuestion) * 100 : 100;
  const timerDanger = timeLeft <= 5;
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  if (phase === 'waiting') {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  // Show waiting screen after answering
  if (phase === 'answered') {
    return (
      <div className="game-page">
        <div className="game-header">
          <div className="game-header-inner">
            <div className="game-progress-info">
              <span className="game-q-label">Question</span>
              <span className="game-q-count">{questionIndex + 1} / {totalQuestions}</span>
            </div>
            <div className="game-progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="game-header-right" />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20 }}>
          <div style={{ fontSize: '3rem' }}>{result?.isCorrect ? '🎉' : '😅'}</div>
          <h2 style={{ fontWeight: 800, color: result?.isCorrect ? 'var(--success)' : 'var(--error)' }}>
            {result?.isCorrect ? `+${result.pointsEarned} points!` : 'Not quite!'}
          </h2>
          {result?.explanation && (
            <p style={{ color: 'var(--gray-600)', maxWidth: 400, textAlign: 'center', fontSize: '0.95rem' }}>
              💡 {result.explanation}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gray-500)', fontSize: '0.9rem' }}>
            <div className="spinner spinner-sm" />
            Waiting for next question...
          </div>
          {/* Live scores */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {sortedScores.map((player, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', background: 'white',
                borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                {player.avatar
                  ? <img src={player.avatar} alt={player.name} className="avatar avatar-sm" />
                  : <div className="avatar avatar-sm">{player.name?.charAt(0)}</div>
                }
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{player.name?.split(' ')[0]}</span>
                <span style={{ fontWeight: 800, color: 'var(--blue-600)' }}>
                  <Zap size={12} fill="var(--blue-500)" color="var(--blue-500)" style={{ display: 'inline' }} />
                  {player.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-page">
      <div className="game-header">
        <div className="game-header-inner">
          <div className="game-progress-info">
            <span className="game-q-label">Question</span>
            <span className="game-q-count">{questionIndex + 1} / {totalQuestions}</span>
          </div>
          <div className="game-progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="game-header-right">
            {isHost && (
              <>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={handleSkip} title="Skip question">
                  <SkipForward size={16} />
                </button>
                <button className="btn btn-danger btn-sm btn-icon" onClick={handleEndGame} title="End game">
                  <XCircle size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="game-layout">
        <div className="game-main">
          <div className="timer-wrapper">
            <svg className="timer-svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--gray-200)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={timerDanger ? 'var(--error)' : 'var(--blue-500)'}
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * timerPercent) / 100}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
              />
            </svg>
            <div className={`timer-value ${timerDanger ? 'danger' : ''}`}>{timeLeft}</div>
          </div>

          {currentQuestion && (
            <>
              <div className="question-card animate-fadeIn">
                <div className="question-badges">
                  <span className={`badge badge-${currentQuestion.difficulty === 'easy' ? 'green' : currentQuestion.difficulty === 'hard' ? 'red' : 'yellow'}`}>
                    {currentQuestion.difficulty?.toUpperCase()}
                  </span>
                  {currentQuestion.currentTurnPlayer && (
                    <span className="badge badge-blue">🎯 {currentQuestion.currentTurnPlayer}'s turn</span>
                  )}
                </div>
                <h2 className="question-text">{currentQuestion.question}</h2>
              </div>

              <div className="options-grid animate-slideUp">
                {currentQuestion.options?.map((option, i) => {
                  let optionClass = 'option-btn';
                  if (phase === 'reveal') {
                    if (i === result?.correctAnswer) optionClass += ' correct';
                    else if (i === selectedOption && !result?.isCorrect) optionClass += ' wrong';
                    else optionClass += ' dimmed';
                  } else if (selectedOption === i) {
                    optionClass += ' selected';
                  }
                  return (
                    <button
                      key={i}
                      className={optionClass}
                      onClick={() => handleAnswer(i)}
                      disabled={phase === 'reveal' || selectedOption !== null}
                      style={{ '--option-color': OPTION_COLORS[i] }}
                    >
                      <span className="option-label">{OPTION_LABELS[i]}</span>
                      <span className="option-text">{option}</span>
                    </button>
                  );
                })}
              </div>

              {phase === 'reveal' && result && (
                <div className={`result-feedback animate-bounceIn ${result.isCorrect ? 'correct' : 'wrong'}`}>
                  <div className="result-icon">{result.isCorrect ? '🎉' : '❌'}</div>
                  <div>
                    <div className="result-title">
                      {result.isCorrect ? `+${result.pointsEarned} points!` : 'Not quite!'}
                    </div>
                    {result.explanation && (
                      <div className="result-explanation">{result.explanation}</div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="game-sidebar">
          <div className="sidebar-header">
            <Users size={16} />
            <span>Leaderboard</span>
          </div>
          <div className="score-list">
            {sortedScores.map((player, i) => (
              <div key={i} className={`score-item ${player.userId === user?._id ? 'me' : ''}`}>
                <div className="score-rank">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>
                {player.avatar ? (
                  <img src={player.avatar} alt={player.name} className="avatar avatar-sm" />
                ) : (
                  <div className="avatar avatar-sm">{player.name?.charAt(0)}</div>
                )}
                <div className="score-name">{player.name?.split(' ')[0]}</div>
                <div className="score-pts">
                  <Zap size={12} fill="var(--blue-500)" color="var(--blue-500)" />
                  {player.score.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;