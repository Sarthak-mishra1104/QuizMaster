/**
 * CreateRoomModal - Host creates a game room
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Settings, Users, Clock, BarChart2, Gamepad2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateRoomModal = ({ onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    numQuestions: 10,
    timePerQuestion: 30,
    difficulty: 'medium',
    gameMode: 'all-answer',
    maxPlayers: 4,
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/rooms/create', form);
      toast.success('Room created! 🎉');
      onClose();
      navigate(`/lobby/${data.room.code}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const difficultyOptions = [
    { value: 'easy', label: '😊 Easy', color: '#10b981' },
    { value: 'medium', label: '🎯 Medium', color: '#f59e0b' },
    { value: 'hard', label: '🔥 Hard', color: '#ef4444' },
    { value: 'mixed', label: '🎲 Mixed', color: '#8b5cf6' },
  ];

  const gameModeOptions = [
    { value: 'all-answer', label: 'All Answer', desc: 'Everyone answers each question' },
    { value: 'turn-based', label: 'Turn Based', desc: 'Players take turns answering' },
  ];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slideUp">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Settings size={20} color="var(--blue-500)" />
            <h2 className="modal-title">Create Room</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Number of Questions */}
          <div className="input-group" style={{ marginBottom: 20 }}>
            <label className="input-label">
              <BarChart2 size={14} style={{ display: 'inline', marginRight: 6 }} />
              Number of Questions: <strong>{form.numQuestions}</strong>
            </label>
            <input
              type="range"
              min={5} max={30} step={5}
              value={form.numQuestions}
              onChange={e => set('numQuestions', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--blue-500)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--gray-400)' }}>
              <span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
            </div>
          </div>

          {/* Time per question */}
          <div className="input-group" style={{ marginBottom: 20 }}>
            <label className="input-label">
              <Clock size={14} style={{ display: 'inline', marginRight: 6 }} />
              Time per Question: <strong>{form.timePerQuestion}s</strong>
            </label>
            <input
              type="range"
              min={10} max={120} step={10}
              value={form.timePerQuestion}
              onChange={e => set('timePerQuestion', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--blue-500)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--gray-400)' }}>
              <span>10s</span><span>30s</span><span>60s</span><span>90s</span><span>2m</span>
            </div>
          </div>

          {/* Max Players */}
          <div className="input-group" style={{ marginBottom: 20 }}>
            <label className="input-label">
              <Users size={14} style={{ display: 'inline', marginRight: 6 }} />
              Max Players
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => set('maxPlayers', n)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 'var(--radius)',
                    border: form.maxPlayers === n ? '2px solid var(--blue-500)' : '2px solid var(--gray-200)',
                    background: form.maxPlayers === n ? 'var(--blue-50)' : 'white',
                    color: form.maxPlayers === n ? 'var(--blue-700)' : 'var(--gray-600)',
                    fontWeight: 700, cursor: 'pointer', transition: 'all var(--transition)',
                    fontFamily: 'var(--font-main)',
                  }}
                >
                  {n === 1 ? '👤' : '👥'} {n}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="input-group" style={{ marginBottom: 20 }}>
            <label className="input-label">Difficulty</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {difficultyOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => set('difficulty', opt.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius)',
                    border: form.difficulty === opt.value ? `2px solid ${opt.color}` : '2px solid var(--gray-200)',
                    background: form.difficulty === opt.value ? `${opt.color}14` : 'white',
                    color: form.difficulty === opt.value ? opt.color : 'var(--gray-600)',
                    fontWeight: 600, cursor: 'pointer', transition: 'all var(--transition)',
                    fontFamily: 'var(--font-main)', fontSize: '0.9rem',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Game Mode */}
          <div className="input-group" style={{ marginBottom: 28 }}>
            <label className="input-label">
              <Gamepad2 size={14} style={{ display: 'inline', marginRight: 6 }} />
              Game Mode
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {gameModeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => set('gameMode', opt.value)}
                  style={{
                    flex: 1, padding: '12px',
                    borderRadius: 'var(--radius)',
                    border: form.gameMode === opt.value ? '2px solid var(--blue-500)' : '2px solid var(--gray-200)',
                    background: form.gameMode === opt.value ? 'var(--blue-50)' : 'white',
                    cursor: 'pointer', transition: 'all var(--transition)',
                    textAlign: 'left', fontFamily: 'var(--font-main)',
                  }}
                >
                  <div style={{ fontWeight: 700, color: form.gameMode === opt.value ? 'var(--blue-700)' : 'var(--gray-800)', fontSize: '0.9rem' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? <><div className="spinner spinner-sm" /> Creating...</> : '🚀 Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
