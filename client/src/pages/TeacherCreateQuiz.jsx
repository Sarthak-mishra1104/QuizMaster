import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, FileText, Plus, Trash2, RefreshCw, Check, Share2, Play, ChevronLeft, Upload } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './TeacherCreateQuiz.css';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const TeacherCreateQuiz = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: setup, 2: review, 3: share
  const [genMode, setGenMode] = useState('topic');
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [pdfFile, setPdfFile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [roomCode, setRoomCode] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [regeneratingIndex, setRegeneratingIndex] = useState(null);

  // Step 1: Generate questions
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
      let data;
      if (genMode === 'topic') {
        const res = await api.post('/quiz/generate/topic', {
          topic: topic.trim(),
          numQuestions,
          difficulty,
        });
        data = res.data;
      } else {
        const formData = new FormData();
        formData.append('pdf', pdfFile);
        formData.append('numQuestions', numQuestions);
        formData.append('difficulty', difficulty);
        const res = await api.post('/quiz/generate/pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        data = res.data;
      }

      setQuestions(data.questions);
      setStep(2);
      toast.success(`${data.questions.length} questions generated! Review them below.`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  // Regenerate a single question
  const handleRegenerateQuestion = async (index) => {
    setRegeneratingIndex(index);
    try {
      const res = await api.post('/quiz/generate/topic', {
        topic: topic || 'General Knowledge',
        numQuestions: 1,
        difficulty,
      });
      const newQuestion = res.data.questions[0];
      const updated = [...questions];
      updated[index] = newQuestion;
      setQuestions(updated);
      toast.success('Question regenerated!');
    } catch {
      toast.error('Failed to regenerate question');
    } finally {
      setRegeneratingIndex(null);
    }
  };

  // Edit a question
  const handleEditQuestion = (index, field, value) => {
    const updated = [...questions];
    if (field === 'question') updated[index].question = value;
    else if (field === 'explanation') updated[index].explanation = value;
    else if (field.startsWith('option')) {
      const optIndex = parseInt(field.replace('option', ''));
      updated[index].options[optIndex] = value;
    } else if (field === 'correctAnswer') {
      updated[index].correctAnswer = parseInt(value);
    }
    setQuestions(updated);
  };

  // Delete a question
  const handleDeleteQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    toast.success('Question removed');
  };

  // Create room and publish quiz
  const handlePublish = async () => {
    if (questions.length < 1) {
      toast.error('Need at least 1 question');
      return;
    }
    setCreatingRoom(true);
    try {
      // Create room
      const roomRes = await api.post('/rooms/create', {
        numQuestions: questions.length,
        difficulty,
        maxPlayers: 50,
        gameMode: 'all-answer',
      });
      const code = roomRes.data.room.code;

      // Save questions to room
      await api.post('/quiz/generate/topic', {
        topic: topic || 'Custom Quiz',
        numQuestions: questions.length,
        difficulty,
        roomCode: code,
        questions, // Send pre-generated questions
      });

      setRoomCode(code);
      setStep(3);
      toast.success('Quiz published! Share the code with students. 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish quiz');
    } finally {
      setCreatingRoom(false);
    }
  };

  // Share via WhatsApp
  const shareWhatsApp = () => {
    const msg = `🧠 *QuizMaster AI Quiz*\n\nYou're invited to join a quiz!\n\n📝 Topic: ${topic || 'Custom Quiz'}\n❓ Questions: ${questions.length}\n\n*Room Code:* ${roomCode}\n\n👉 Join here: https://quizmaster-ai-eight.vercel.app\n\nEnter the code to join!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="page">
      <div className="container-md">

        {/* Header */}
        <div className="create-quiz-header animate-fadeIn">
          <button className="btn btn-ghost btn-sm" onClick={() => step === 1 ? navigate('/teacher/dashboard') : setStep(step - 1)}>
            <ChevronLeft size={18} /> Back
          </button>
          <div className="create-quiz-steps">
            {['Setup', 'Review', 'Share'].map((s, i) => (
              <div key={i} className={`step-item ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
                <div className="step-dot">
                  {step > i + 1 ? <Check size={12} /> : i + 1}
                </div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Setup */}
        {step === 1 && (
          <div className="create-quiz-setup card animate-slideUp">
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--gray-200)' }}>
              <h2 style={{ margin: 0 }}>📝 Create Quiz</h2>
              <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Set up your quiz parameters</p>
            </div>
            <div style={{ padding: 28 }}>
              {/* Mode Toggle */}
              <div className="input-group" style={{ marginBottom: 24 }}>
                <label className="input-label">Question Source</label>
                <div style={{ display: 'flex', gap: 10 }}>
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
              </div>

              {genMode === 'topic' ? (
                <div className="input-group" style={{ marginBottom: 20 }}>
                  <label className="input-label">Topic</label>
                  <input
                    className="input"
                    placeholder="e.g. Data Structures, World War II, Python..."
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                  />
                </div>
              ) : (
                <div style={{ marginBottom: 20 }}>
                  <label className="input-label">Upload PDF</label>
                  <div
                    style={{
                      border: `2px dashed ${pdfFile ? 'var(--blue-400)' : 'var(--gray-300)'}`,
                      background: pdfFile ? 'var(--blue-50)' : 'var(--gray-50)',
                      borderRadius: 'var(--radius)',
                      padding: '32px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      marginTop: 6,
                    }}
                    onClick={() => document.getElementById('pdf-upload').click()}
                  >
                    <Upload size={28} color={pdfFile ? 'var(--blue-500)' : 'var(--gray-400)'} style={{ margin: '0 auto 10px', display: 'block' }} />
                    <div style={{ fontWeight: 600, color: pdfFile ? 'var(--blue-700)' : 'var(--gray-600)' }}>
                      {pdfFile ? pdfFile.name : 'Click to upload PDF'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 4 }}>Max 10MB</div>
                  </div>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={e => setPdfFile(e.target.files[0])}
                  />
                </div>
              )}

              {/* Number of Questions */}
              <div className="input-group" style={{ marginBottom: 20 }}>
                <label className="input-label">Number of Questions: <strong>{numQuestions}</strong></label>
                <input
                  type="range" min={5} max={30} step={5}
                  value={numQuestions}
                  onChange={e => setNumQuestions(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--blue-500)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                  <span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
                </div>
              </div>

              {/* Difficulty */}
              <div className="input-group" style={{ marginBottom: 28 }}>
                <label className="input-label">Difficulty</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {['easy', 'medium', 'hard', 'mixed'].map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius)',
                        border: difficulty === d ? '2px solid var(--blue-500)' : '2px solid var(--gray-200)',
                        background: difficulty === d ? 'var(--blue-50)' : 'white',
                        color: difficulty === d ? 'var(--blue-700)' : 'var(--gray-600)',
                        fontWeight: 600,
                        cursor: 'pointer',
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
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <><div className="spinner spinner-sm" /> Generating with AI...</>
                ) : (
                  <><Cpu size={18} /> Generate {numQuestions} Questions</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review Questions */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <div className="section-eyebrow">Step 2 of 3</div>
                <h2>Review Questions ({questions.length})</h2>
              </div>
              <button className="btn btn-primary" onClick={handlePublish} disabled={creatingRoom}>
                {creatingRoom ? <><div className="spinner spinner-sm" /> Publishing...</> : <><Check size={16} /> Publish Quiz</>}
              </button>
            </div>

            <div className="questions-review-list">
              {questions.map((q, i) => (
                <div key={i} className="question-review-card card animate-fadeIn">
                  <div className="question-review-header">
                    <div className="question-review-num">Q{i + 1}</div>
                    <div className="question-review-actions">
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => setEditingIndex(editingIndex === i ? null : i)}
                        title="Edit question"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => handleRegenerateQuestion(i)}
                        disabled={regeneratingIndex === i}
                        title="Regenerate this question"
                      >
                        {regeneratingIndex === i ? <div className="spinner spinner-sm" /> : <RefreshCw size={15} />}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => handleDeleteQuestion(i)}
                        title="Delete question"
                        style={{ color: 'var(--error)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {editingIndex === i ? (
                    // Edit mode
                    <div className="question-edit-form">
                      <div className="input-group" style={{ marginBottom: 12 }}>
                        <label className="input-label">Question</label>
                        <textarea
                          className="input"
                          rows={3}
                          value={q.question}
                          onChange={e => handleEditQuestion(i, 'question', e.target.value)}
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                        {q.options.map((opt, j) => (
                          <div key={j} className="input-group">
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <input
                                type="radio"
                                name={`correct-${i}`}
                                checked={q.correctAnswer === j}
                                onChange={() => handleEditQuestion(i, 'correctAnswer', j)}
                                style={{ accentColor: 'var(--blue-500)' }}
                              />
                              Option {OPTION_LABELS[j]} {q.correctAnswer === j && <span className="badge badge-green">Correct</span>}
                            </label>
                            <input
                              className="input"
                              value={opt}
                              onChange={e => handleEditQuestion(i, `option${j}`, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="input-group" style={{ marginBottom: 12 }}>
                        <label className="input-label">Explanation</label>
                        <input
                          className="input"
                          value={q.explanation}
                          onChange={e => handleEditQuestion(i, 'explanation', e.target.value)}
                          placeholder="Why is this the correct answer?"
                        />
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => setEditingIndex(null)}>
                        <Check size={14} /> Done Editing
                      </button>
                    </div>
                  ) : (
                    // View mode
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: 14, fontSize: '0.95rem' }}>
                        {q.question}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {q.options.map((opt, j) => (
                          <div
                            key={j}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-sm)',
                              border: `1.5px solid ${q.correctAnswer === j ? 'var(--success)' : 'var(--gray-200)'}`,
                              background: q.correctAnswer === j ? 'var(--success-light)' : 'var(--gray-50)',
                              fontSize: '0.85rem',
                              display: 'flex', alignItems: 'center', gap: 8,
                            }}
                          >
                            <span style={{ fontWeight: 800, color: q.correctAnswer === j ? 'var(--success)' : 'var(--gray-400)', fontSize: '0.8rem' }}>
                              {OPTION_LABELS[j]}
                            </span>
                            <span style={{ color: q.correctAnswer === j ? '#065f46' : 'var(--gray-700)' }}>{opt}</span>
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--blue-50)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--blue-400)', fontSize: '0.82rem', color: 'var(--gray-600)' }}>
                          💡 {q.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add more questions */}
            <button
              className="btn btn-secondary btn-full"
              style={{ marginTop: 16 }}
              onClick={() => setStep(1)}
            >
              <Plus size={16} /> Generate More Questions
            </button>
          </div>
        )}

        {/* Step 3: Share */}
        {step === 3 && (
          <div className="share-step animate-bounceIn">
            <div className="share-success-icon">🎉</div>
            <h2>Quiz Published!</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: 32 }}>
              Share this code with your students to join the quiz
            </p>

            <div className="share-code-card">
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                Room Code
              </div>
              <div className="share-code">{roomCode}</div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { navigator.clipboard.writeText(roomCode); toast.success('Copied!'); }}
              >
                Copy Code
              </button>
            </div>

            <div className="share-actions">
              <button className="btn share-whatsapp-btn" onClick={shareWhatsApp}>
                <span>📱</span> Share via WhatsApp
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate(`/lobby/${roomCode}`)}
              >
                <Play size={18} fill="white" /> Go to Lobby
              </button>
            </div>

            <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', marginTop: 16 }}>
              Students can join at: <strong>quizmaster-ai-eight.vercel.app</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCreateQuiz;