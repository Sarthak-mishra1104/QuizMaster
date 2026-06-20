import React from 'react';
import {
  Brain,
  FileText,
  Users,
  Trophy,
  BarChart3,
  Clock3,
  ShieldCheck,
  Sparkles,
  Building
} from 'lucide-react';
import './About.css';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Quiz Generation',
    desc: 'Generate intelligent quizzes instantly on any topic using advanced AI technology.'
  },
  {
    icon: FileText,
    title: 'PDF-Based Learning',
    desc: 'Upload study materials and automatically create quizzes from document content.'
  },
  {
    icon: Users,
    title: 'Multiplayer Battles',
    desc: 'Challenge friends, classmates, teachers, and family members in real-time quiz competitions.'
  },
  {
    icon: Trophy,
    title: 'Live Leaderboards',
    desc: 'Compete for top rankings with real-time score tracking and performance updates.'
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    desc: 'Monitor accuracy, scores, wins, and overall learning progress.'
  },
  {
    icon: Clock3,
    title: 'Timed Challenges',
    desc: 'Improve decision-making speed with timed quiz challenges and bonus scoring.'
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Reliable',
    desc: 'Built with modern technologies to provide a safe and secure experience.'
  },
  {
    icon: Sparkles,
    title: 'Interactive Learning',
    desc: 'Transform traditional learning into an engaging and enjoyable experience.'
  }
];

const About = () => {
  return (
    <div className="page">
      <div className="container-sm">

        <div className="about-hero card animate-bounceIn">
          <div
            className="about-identity"
            style={{
              textAlign: 'center',
              width: '100%'
            }}
          >
            <img
              src="/intellisys-logo.png"
              alt="Intellisys Technologies"
              style={{
                maxWidth: '220px',
                marginBottom: '24px'
              }}
            />

            <div className="section-eyebrow">
              Powered By Intellisys Technologies
            </div>

            <h1 className="about-name">
              QuizMaster AI
            </h1>

            <div
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#4169E1',
                marginBottom: '20px'
              }}
            >
              Created & Developed by Sarthak Mishra
            </div>

            <p
              className="about-bio"
              style={{
                maxWidth: '800px',
                margin: '0 auto',
                lineHeight: '1.8'
              }}
            >
              QuizMaster AI is an AI-powered multiplayer learning platform
              designed to make education interactive, engaging, and competitive.

              <br /><br />

              The platform enables students, teachers, and quiz enthusiasts
              to create AI-generated quizzes, upload PDFs for automated quiz
              creation, and participate in exciting real-time multiplayer quiz battles.

              <br /><br />

              Challenge your friends, classmates, family members, and teachers
              through intelligent quizzes generated instantly using advanced
              artificial intelligence.

              <br /><br />

              With live leaderboards, performance analytics, timed challenges,
              and interactive learning experiences, QuizMaster AI helps users
              learn faster while having fun.

              <br /><br />

              QuizMaster AI was conceptualized and developed by
              <strong> Sarthak Mishra </strong>
              and is proudly powered by
              <strong> Intellisys Technologies</strong>.

              Our mission is to combine education and artificial intelligence
              to create smarter, faster, and more engaging learning experiences
              for learners worldwide.
            </p>
          </div>
        </div>

        <div
          className="about-features card animate-fadeIn"
          style={{ marginTop: '24px' }}
        >
          <div
            style={{
              padding: '24px 28px',
              borderBottom: '1px solid var(--gray-200)'
            }}
          >
            <div className="section-eyebrow">
              Features
            </div>

            <h2 style={{ margin: 0 }}>
              What QuizMaster AI Offers
            </h2>
          </div>

          <div style={{ padding: '20px 28px' }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div key={index} className="feature-row">
                  <div className="feature-row-icon">
                    <Icon size={22} />
                  </div>

                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}
                    >
                      {feature.title}
                    </div>

                    <div
                      style={{
                        fontSize: '0.9rem',
                        color: 'var(--gray-500)'
                      }}
                    >
                      {feature.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="about-footer animate-fadeIn"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '24px',
            fontWeight: '600'
          }}
        >
          <Building size={18} />
          <span>
            Created by Sarthak Mishra • Powered by Intellisys Technologies
          </span>
        </div>

      </div>
    </div>
  );
};

export default About;