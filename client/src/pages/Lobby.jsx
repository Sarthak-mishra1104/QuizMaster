import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Copy, Check, Upload, Cpu, Play, Users, FileText, Hash, AlertCircle, Share2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Lobby.css';

const Lobby = () => {
  const { code } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isHost, setIsHost] = useState(false);

  const [topic, setTopic] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [genMode, setGenMode] = useState('topic');
  const [generating, setGenerating] = useState(false);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [starting, setStarting] = useState(false);
  const fileRef = useRef();

  const joinRoom = useCallback(() => {
    if (!socket || !user) return;
    socket.emit('join-room', { roomCode: code }, (res) => {
      if (res?.error) {
        toast.error(res.error);
        navigate('/dashboard');
      } else if (res?.room) {
        setRoom(res.room);
        setIsHost(res.room.players.find(p => p.userId === user._id)?.isHost || false);
        setQuestionsReady(res.room.questionCount > 0);
        setLoading(false);
      }
    });
  }, [socket, user, code, navigate]);

  useEffect(() => {
    if (socket && user) joinRoom();
  }, [socket, user, joinRoom]);

  useEffect(() => {
    if (!socket) return;

    const onPlayerJoined = ({ room: updatedRoom }) => {
      setRoom(updatedRoom);
      toast.success('A player joined! 👋', { duration: 2000 });
    };

    const onPlayerLeft = ({ name, room: updatedRoom }) => {
      setRoom(updatedRoom);
      toast(`${name} left the room`, { icon: '👋', duration: 2000 });
    };

    const onGameStarted = ({ totalQuestions, settings }) => {
      console.log('Game started! Navigating to game...');
      navigate(`/game/${code}`, { state: { totalQuestions, settings } });
    };

    socket.on('player-joined', onPlayerJoined);
    socket.on('player-left', onPlayerLeft);
    socket.on('game-started', onGameStarted);

    return () => {
      socket.off('player-joined', onPlayerJoined);
      socket.off('player-left', onPlayerLeft);
      socket.off('game-started', onGameStarted);
    };
  }, [socket, code, navigate]);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Room code copied!');
  };

  const shareWhatsApp = () => {
    const msg = `🧠 *QuizMaster AI*\n\nJoin my quiz!\n\n*Room Code:* ${code}\n\n👉 https://quizmaster-ai-eight.vercel.app\n\nEnter the code to join!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleGenerate = async () => {
    if (genMode === 'topic' && !topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    if (genMode === 'pdf' && !pdfFile) {
      toast.error('Please select a PDF file');
      return;
    }

    setGenerating(true);
    try {
      if (genMode === 'topic') {
        const { data } = await api.post('/quiz/generate/topic', {
          topic: topic.trim(),
          numQuestions: room?.settings?.numQuestions || 10,
          difficulty: room?.settings?.difficulty || 'medium',
          roomCode: code,
        });
        toast.success(`${data.count} questions generated! ✨`);
      } else {
        const formData = new FormData();
        formData.append('pdf', pdfFile);
        formData.append('numQuestions', room?.settings?.numQuestions || 10);
        formData.append('difficulty', room?.settings?.difficulty || 'medium');
        formData.append('roomCode', code);

        const { data } = await api.post('/quiz/generate/pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(`${data.count} questions from PDF! ✨`);
      }

      setQuestionsReady(true);
      toast.success('Questions ready! You can start the game.', { duration: 3000 });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleStartGame = () => {
    if (!questionsReady) {
      toast.error('Generate questions first!');
      return;
    }
    setStarting(true);
    socket.emit('start-game', { roomCode: code }, (res) => {
      if (res?.error) {
        toast.error(res.error);
        setStarting(false);
      }
    });
  };

  const connectedPlayers = room?.players?.filter(p => p.isConnected) || [];

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p>Connecting to room...</p>
        </div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="page">
      <div className="container-md">

        {/* Room Header */}
        <div className="lobby-header animate-fadeIn">
          <div>
            <div className="section-eyebrow">Waiting Room</div>
            <h1 style={{ marginBottom: 6 }}>
              {room.settings?.topic ? `Quiz: ${room.settings.topic}` : 'Setting Up Quiz'}
            </h1>
            <p style={{ color: 'var(--gray-500)' }}>
              {room.settings?.numQuestions} questions · {room.settings?.timePerQuestion}s per question · {room.settings?.difficulty}
            </p>
          </div>

          <div className="room-code-card">
            <div className="room-code-label">
              <Hash size={14} /> Room Code
            </div>
            <div className="room-code">{code}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm btn-secondary" onClick={copyCode}>
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
              <button className="btn btn-sm" onClick={shareWhatsApp} style={{ background: '#25d366', color: 'white', borderRadius: 'var(--radius-sm)', padding: '6px 12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Share2 size={13} /> Share
              </button>
            </div>
          </div>
        </div>

        <div className="lobby-grid">
          {/* Left: Players */}
          <div className="lobby-section">
            <div className="card">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Users size={18} color="var(--blue-500)" />
                  <h3 style={{ fontSize: '1rem', margin: 0 }}>
                    Players ({room.players?.length || 0}/{room.settings?.maxPlayers})
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: connectedPlayers.length > 0 ? 'var(--success)' : 'var(--gray-300)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600 }}>
                    {connectedPlayers.length} online
                  </span>
                </div>
              </div>
              <div style={{ padding: '12px 16px' }}>
                {room.players?.map((player, i) => (
                  <div key={i} className="lobby-player">
                    <div className="player-left">
                      {player.avatar ? (
                        <img src={player.avatar} alt={player.name} className="avatar avatar-md" />
                      ) : (
                        <div className="avatar avatar-md">{player.name?.charAt(0)}</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '0.9rem' }}>
                          {player.name}
                          {player.userId === user?._id && <span className="badge badge-blue" style={{ marginLeft: 8 }}>You</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: player.isConnected ? 'var(--success)' : 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: player.isConnected ? 'var(--success)' : 'var(--gray-300)' }} />
                          {player.isConnected ? 'Online' : 'Offline'}
                        </div>
                      </div>
                    </div>
                    {player.isHost && <span className="badge badge-blue">👑 Host</span>}
                  </div>
                ))}

                {Array.from({ length: Math.max(0, Math.min(3, (room.settings?.maxPlayers || 4) - (room.players?.length || 0))) }).map((_, i) => (
                  <div key={`empty-${i}`} className="lobby-player empty">
                    <div className="avatar avatar-md" style={{ opacity: 0.3, border: '2px dashed var(--gray-300)', background: 'none' }}>?</div>
                    <span style={{ color: 'var(--gray-400)', fontSize: '0.88rem' }}>Waiting for player...</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="share-tip">
              <AlertCircle size={16} />
              Share code <strong>{code}</strong> with friends to invite them!
            </div>
          </div>

          {/* Right: Host controls or waiting */}
          <div className="lobby-section">
            {isHost ? (
              <div className="card">
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Cpu size={18} color="var(--blue-500)" />
                  <h3 style={{ fontSize: '1rem', margin: 0 }}>Generate Questions</h3>
                </div>
                <div style={{ padding: 20 }}>

                  {/* Live student monitor */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', background: connectedPlayers.length > 1 ? 'var(--success-light)' : 'var(--blue-50)',
                    borderRadius: 'var(--radius)', border: `1px solid ${connectedPlayers.length > 1 ? 'var(--success)' : 'var(--blue-200)'}`,
                    marginBottom: 20,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: connectedPlayers.length > 1 ? 'var(--success)' : 'var(--blue-400)' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: connectedPlayers.length > 1 ? '#065f46' : 'var(--blue-700)' }}>
                        {connectedPlayers.length} player(s) connected
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                      Max: {room?.settings?.maxPlayers}
                    </span>
                  </div>

                  {/* Mode selector */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    <button
                      className={`btn btn-sm ${genMode === 'topic' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setGenMode('topic')}
                      style={{ flex: 1 }}
                    >
                      <Cpu size={14} /> By Topic
                    </button>
                    <button
                      className={`btn btn-sm ${genMode === 'pdf' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setGenMode('pdf')}
                      style={{ flex: 1 }}
                    >
                      <FileText size={14} /> From PDF
                    </button>
                  </div>

                  {genMode === 'topic' ? (
                    <div className="input-group" style={{ marginBottom: 16 }}>
                      <label className="input-label">Quiz Topic</label>
                      <input
                        className="input"
                        placeholder="e.g. Data Structures, Python, World History..."
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                      />
                    </div>
                  ) : (
                    <div style={{ marginBottom: 16 }}>
                      <div
                        onClick={() => fileRef.current?.click()}
                        style={{
                          border: `2px dashed ${pdfFile ? 'var(--blue-400)' : 'var(--gray-300)'}`,
                          background: pdfFile ? 'var(--blue-50)' : 'var(--gray-50)',
                          borderRadius: 'var(--radius)',
                          padding: '24px 20px',
                          textAlign: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Upload size={24} color={pdfFile ? 'var(--blue-500)' : 'var(--gray-400)'} style={{ margin: '0 auto 8px', display: 'block' }} />
                        <div style={{ fontWeight: 600, color: pdfFile ? 'var(--blue-700)' : 'var(--gray-600)', fontSize: '0.9rem' }}>
                          {pdfFile ? pdfFile.name : 'Click to upload PDF'}
                        </div>
                      </div>
                      <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e => setPdfFile(e.target.files[0])} />
                    </div>
                  )}

                  <button
                    className="btn btn-secondary btn-full"
                    onClick={handleGenerate}
                    disabled={generating}
                    style={{ marginBottom: 12 }}
                  >
                    {generating ? (
                      <><div className="spinner spinner-sm" /> Generating with AI...</>
                    ) : (
                      <><Cpu size={16} /> Generate {room.settings?.numQuestions} Questions</>
                    )}
                  </button>

                  {questionsReady && (
                    <div style={{ background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 12, color: '#065f46', fontSize: '0.85rem', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Check size={16} /> Questions ready! Start the game when everyone joins.
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-full btn-lg"
                    onClick={handleStartGame}
                    disabled={!questionsReady || starting}
                  >
                    {starting ? (
                      <><div className="spinner spinner-sm" /> Starting...</>
                    ) : (
                      <><Play size={18} fill="white" /> Start Game ({connectedPlayers.length} players)</>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="card waiting-card">
                <div className="waiting-animation">
                  <div className="waiting-dot" />
                  <div className="waiting-dot" />
                  <div className="waiting-dot" />
                </div>
                <h3 style={{ marginBottom: 8 }}>Waiting for Host</h3>
                <p style={{ color: 'var(--gray-500)' }}>
                  The host is setting up the quiz. Get ready to play!
                </p>
                <div style={{ marginTop: 20, padding: '14px', background: 'var(--blue-50)', borderRadius: 'var(--radius)', border: '1px solid var(--blue-200)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--blue-700)', marginBottom: 4 }}>Room Code</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--blue-600)', letterSpacing: '0.15em' }}>{code}</div>
                </div>
                <div style={{ marginTop: 16, fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                  {connectedPlayers.length} player(s) in room
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;