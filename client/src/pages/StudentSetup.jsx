import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ChevronRight, Hash, ArrowRight } from 'lucide-react';
import './StudentSetup.css';

const GRADES = [
  'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12', 'College 1st Year', 'College 2nd Year',
  'College 3rd Year', 'College 4th Year', 'Post Graduate',
];

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Computer Science', 'English', 'History', 'Geography',
  'Economics', 'Political Science', 'Psychology', 'Sociology',
  'Data Structures', 'DBMS', 'Operating Systems', 'Networking',
  'Machine Learning', 'Web Development', 'General Knowledge',
];

const DIFFICULTIES = [
  { value: 'easy', label: '😊 Easy', desc: 'Basic concepts' },
  { value: 'medium', label: '🎯 Medium', desc: 'Moderate challenge' },
  { value: 'hard', label: '🔥 Hard', desc: 'Advanced level' },
  { value: 'mixed', label: '🎲 Mixed', desc: 'All levels' },
];

const StudentSetup = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: grade/subject, 2: quiz config
  const [grade, setGrade] = useState(user?.grade || '');
  const [subject, setSubject] = useState(user?.subject || '');
  const [saving, setSaving] = useState(false);

  // Quiz config
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [joinCode, setJoinCode] = useState('');
  const [joinType, setJoinType] = useState('code'); // 'code' or 'solo'

  const handleNext = async () => {
    if (!grade) { toast.error('Please select your grade'); return; }
    if (!subject) { toast.error('Please select your subject'); return; }

    setSaving(true);
    try {
      const { data } = await api.put('/users/role', {
        role: 'student',
        grade,
        subject,
      });
      updateUser(data.user);
      setStep(2);
    } catch {
      toast.error('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleJoinWithCode = () => {
    if (joinCode.trim().length !== 6) {
      toast.error('Please enter a valid 6-character code');
      return;
    }
    navigate(`/lobby/${joinCode.toUpperCase()}`);
  };

  const handleSoloQuiz = async () => {
    try {
      // Create solo room
      const roomRes = await api.post('/rooms/create', {
        numQuestions,
        difficulty,
        maxPlayers: 1,
        gameMode: 'all-answer',
      });
      const code = roomRes.data.room.code;

      // Generate questions
      await api.post('/quiz/generate/topic', {
        topic: subject,
        numQuestions,
        difficulty,
        roomCode: code,
      });

      navigate(`/lobby/${code}`);
      toast.success('Quiz ready! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create quiz');
    }
  };

  return (
    <div className="student-setup-page">
      <div className="student-setup-container animate-slideUp">

        {step === 1 && (
          <>
            {/* Header */}
            <div className="student-setup-header">
              <div className="student-setup-emoji">🎓</div>
              <h1>Student Setup</h1>
              <p>Select your grade and subject to get started</p>
            </div>

            {/* Grade Selection */}
            <div className="setup-section">
              <label className="setup-label">Select Your Grade</label>
              <div className="grade-grid">
                {GRADES.map(g => (
                  <button
                    key={g}
                    className={`grade-chip ${grade === g ? 'selected' : ''}`}
                    onClick={() => setGrade(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Selection */}
            <div className="setup-section">
              <label className="setup-label">Select Your Subject</label>
              <div className="subject-grid">
                {SUBJECTS.map(s => (
                  <button
                    key={s}
                    className={`subject-chip ${subject === s ? 'selected' : ''}`}
                    onClick={() => setSubject(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected summary */}
            {(grade || subject) && (
              <div className="setup-summary">
                {grade && <span className="badge badge-blue">📚 {grade}</span>}
                {subject && <span className="badge badge-blue">📖 {subject}</span>}
              </div>
            )}

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleNext}
              disabled={saving || !grade || !subject}
              style={{ marginTop: 24 }}
            >
              {saving ? (
                <><div className="spinner spinner-sm" /> Saving...</>
              ) : (
                <>Next <ChevronRight size={18} /></>
              )}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="student-setup-header">
              <div className="student-setup-emoji">🎮</div>
              <h1>Quiz Options</h1>
              <p>How do you want to play?</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
                <span className="badge badge-blue">📚 {grade}</span>
                <span className="badge badge-blue">📖 {subject}</span>
              </div>
            </div>

            {/* Join type toggle */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
              <button
                className={`btn btn-sm ${joinType === 'code' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setJoinType('code')}
                style={{ flex: 1 }}
              >
                🔑 Join with Code
              </button>
              <button
                className={`btn btn-sm ${joinType === 'solo' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setJoinType('solo')}
                style={{ flex: 1 }}
              >
                🎯 Solo Quiz
              </button>
            </div>

            {joinType === 'code' ? (
              <>
                {/* Join with teacher code */}
                <div className="setup-section">
                  <label className="setup-label">Enter Room Code</label>
                  <div className="join-code-box">
                    <Hash size={20} color="var(--gray-400)" />
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                      onKeyDown={e => e.key === 'Enter' && handleJoinWithCode()}
                      className="join-code-input-field"
                      maxLength={6}
                    />
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginTop: 8 }}>
                    Ask your teacher for the room code
                  </p>
                </div>

                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleJoinWithCode}
                  disabled={joinCode.length !== 6}
                >
                  Join Quiz <ArrowRight size={18} />
                </button>
              </>
            ) : (
              <>
                {/* Solo quiz config */}
                <div className="setup-section">
                  <label className="setup-label">Number of Questions: <strong>{numQuestions}</strong></label>
                  <input
                    type="range" min={5} max={30} step={5}
                    value={numQuestions}
                    onChange={e => setNumQuestions(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--blue-500)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 4 }}>
                    <span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
                  </div>
                </div>

                <div className="setup-section">
                  <label className="setup-label">Difficulty Level</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {DIFFICULTIES.map(d => (
                      <button
                        key={d.value}
                        onClick={() => setDifficulty(d.value)}
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--radius)',
                          border: difficulty === d.value ? '2px solid var(--blue-500)' : '2px solid var(--gray-200)',
                          background: difficulty === d.value ? 'var(--blue-50)' : 'white',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-main)',
                          textAlign: 'left',
                          transition: 'all var(--transition)',
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: difficulty === d.value ? 'var(--blue-700)' : 'var(--gray-800)' }}>
                          {d.label}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>{d.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleSoloQuiz}
                >
                  🚀 Start Solo Quiz
                </button>
              </>
            )}

            <button
              className="btn btn-ghost btn-full"
              onClick={() => setStep(1)}
              style={{ marginTop: 12 }}
            >
              ← Change Grade/Subject
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentSetup;

