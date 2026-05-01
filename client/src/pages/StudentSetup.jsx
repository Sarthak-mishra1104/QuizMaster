import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ChevronRight } from 'lucide-react';
import './StudentSetup.css';

const GRADES = [
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
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

const StudentSetup = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [grade, setGrade] = useState(user?.grade || '');
  const [subject, setSubject] = useState(user?.subject || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
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
      toast.success('Profile saved! 🎉');
      navigate('/student/dashboard');
    } catch {
      toast.error('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="student-setup-page">
      <div className="student-setup-container animate-slideUp">
        {/* Header */}
        <div className="student-setup-header">
          <div className="student-setup-emoji">🎓</div>
          <h1>Student Setup</h1>
          <p>Tell us about yourself so we can personalize your experience</p>
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
          onClick={handleSave}
          disabled={saving || !grade || !subject}
          style={{ marginTop: 24 }}
        >
          {saving ? (
            <><div className="spinner spinner-sm" /> Saving...</>
          ) : (
            <>Continue <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default StudentSetup;