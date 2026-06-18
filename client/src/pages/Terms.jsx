import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '40px 20px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px'
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              border: 'none',
              background: '#4169E1',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        <div
          style={{
            textAlign: 'center',
            marginBottom: '40px',
            padding: '30px',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}
        >
          <FileText
            size={64}
            style={{
              color: '#4169E1',
              marginBottom: '16px'
            }}
          />

          <h1>QuizMaster AI Terms & Conditions</h1>

          <p
            style={{
              color: '#6B7280'
            }}
          >
            Powered by Intellisys Technologies
          </p>

          <p
            style={{
              color: '#9CA3AF',
              fontSize: '0.9rem'
            }}
          >
            Last Updated: June 2026
          </p>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: '32px',
            borderRadius: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            lineHeight: '1.8'
          }}
        >
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using QuizMaster AI, you agree to comply with
            these Terms and Conditions.
          </p>

          <h2>Use of the Platform</h2>
          <p>
            QuizMaster AI is intended for educational, training, and
            entertainment purposes. Users agree to use the platform responsibly.
          </p>

          <h2>User Accounts</h2>
          <p>
            Users are responsible for maintaining the security of their accounts
            and any activity performed under their account.
          </p>

          <h2>Fair Usage</h2>
          <ul>
            <li>No cheating or manipulation of quiz results.</li>
            <li>No abuse of multiplayer rooms.</li>
            <li>No harmful or offensive content.</li>
            <li>No attempts to disrupt platform services.</li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>
            QuizMaster AI, its branding, software, and content are the property
            of Intellisys Technologies unless otherwise stated.
          </p>

          <h2>Service Availability</h2>
          <p>
            We strive to maintain uninterrupted service but cannot guarantee
            continuous availability at all times.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            Intellisys Technologies shall not be liable for indirect damages,
            data loss, or interruptions arising from the use of the platform.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            These Terms may be updated periodically. Continued use of the
            platform indicates acceptance of revised terms.
          </p>

          <h2>Contact</h2>
          <p>
            For questions regarding these Terms & Conditions, please contact:

Email: quizmaster.ai.app@gmail.com

Owner: Sarthak Mishra
QuizMaster AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;