import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
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
        {/* Back Button */}
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

        {/* Header */}
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
          <ShieldCheck
            size={64}
            style={{
              color: '#4169E1',
              marginBottom: '16px'
            }}
          />

          <h1
            style={{
              marginBottom: '10px',
              color: '#111827'
            }}
          >
            QuizMaster AI Privacy Policy
          </h1>

          <p
            style={{
              color: '#6B7280',
              marginBottom: '8px'
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

        {/* Content */}
        <div
          style={{
            background: '#ffffff',
            padding: '32px',
            borderRadius: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            lineHeight: '1.8'
          }}
        >
          <h2>Introduction</h2>
          <p>
            QuizMaster AI is developed and maintained by <strong>Intellisys Technologies</strong>.
            We respect your privacy and are committed to protecting your personal information
            and ensuring transparency regarding how your data is collected and used.
          </p>

          <h2>Information We Collect</h2>
          <ul>
            <li>Name and profile information obtained through Google Login.</li>
            <li>Email address used for authentication and account access.</li>
            <li>Quiz scores, rankings, achievements, and performance statistics.</li>
            <li>Quiz history, learning progress, and activity records.</li>
            <li>Basic device and usage information required for platform functionality.</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>Provide secure authentication and account management.</li>
            <li>Store quiz history and learning analytics.</li>
            <li>Display rankings, leaderboards, and performance insights.</li>
            <li>Improve platform reliability, security, and user experience.</li>
            <li>Develop new educational and AI-powered features.</li>
          </ul>

          <h2>Data Storage & Security</h2>
          <p>
            User data is securely stored using trusted cloud services and protected
            using industry-standard security practices. We continuously monitor
            and improve our systems to safeguard user information.
          </p>

          <h2>Third-Party Services</h2>
          <ul>
            <li>Google Authentication</li>
            <li>MongoDB Atlas</li>
            <li>Vercel Hosting</li>
            <li>Render Services</li>
            <li>Socket.IO Real-Time Communication</li>
          </ul>

          <h2>Data Sharing</h2>
          <p>
            QuizMaster AI does not sell, rent, or trade personal information
            to third parties. User information is only used for delivering
            platform services and improving educational experiences.
          </p>

          <h2>Your Rights</h2>
          <p>
            Users may request correction, update, or deletion of their account
            information by contacting the platform administrators.
          </p>

          <h2>Contact Us</h2>
          <p>
           For privacy-related concerns, contact us at:
quizmaster.ai.app@gmail.com

Owner: Sarthak Mishra
QuizMaster AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;