/**
 * JoinRoomModal - Join existing game with room code
 */
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Hash, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const JoinRoomModal = ({ onClose }) => {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const fullCode = code.join('').toUpperCase();

  const handleChange = (index, value) => {
    const char = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && fullCode.length === 6) handleJoin();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const newCode = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
    setCode(newCode);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleJoin = () => {
    if (fullCode.length !== 6) {
      toast.error('Please enter the full 6-character room code');
      return;
    }
    onClose();
    navigate(`/lobby/${fullCode}`);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slideUp" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Hash size={20} color="var(--blue-500)" />
            <h2 className="modal-title">Join Room</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--gray-500)', marginBottom: 28, textAlign: 'center' }}>
            Enter the 6-character room code shared by your host
          </p>

          {/* Code input boxes */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
            {code.map((char, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                maxLength={1}
                value={char}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={handlePaste}
                style={{
                  width: 48, height: 56,
                  textAlign: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.05em',
                  border: `2px solid ${char ? 'var(--blue-400)' : 'var(--gray-200)'}`,
                  borderRadius: 'var(--radius)',
                  outline: 'none',
                  color: 'var(--blue-700)',
                  background: char ? 'var(--blue-50)' : 'white',
                  transition: 'all var(--transition)',
                  caretColor: 'var(--blue-500)',
                }}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleJoin}
            disabled={fullCode.length !== 6}
          >
            Join Game <ArrowRight size={18} />
          </button>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.82rem', color: 'var(--gray-400)' }}>
            Ask your host for the room code to join
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomModal;
