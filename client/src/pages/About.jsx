import React from 'react';
import { Github, Linkedin, Globe, Mail, Zap, Code, Heart } from 'lucide-react';
import './About.css';

const DEVELOPER = {
  name: 'Sarthak Mishra',
  title: 'Full Stack Developer',
  bio: `Passionate about building scalable web applications and AI-powered tools.
I love creating experiences that are both technically solid and a joy to use.
QuizMaster AI was built to make learning more engaging and competitive.`,
  avatar: 'https://raw.githubusercontent.com/Sarthak-mishra1104/QuizMaster/main/client/src/pages/profile.jpeg',
  email: 'sarthakmishra.2431078@gmail.com',
  social: {
    github: 'https://github.com/Sarthak-mishra1104',
    linkedin: 'https://linkedin.com/in/sarthak-mishra-1a8041306',
    twitter: '',
    website: 'https://my-portfolio-q2yv.vercel.app',
  },
  skills: [
    'React.js', 'Node.js', 'MongoDB', 'Socket.io',
    'Express.js', 'Groq AI', 'JavaScript', 'TypeScript',
  ],
};

const techStack = [
  { icon: '⚛️', name: 'React.js', desc: 'Frontend UI' },
  { icon: '🟢', name: 'Node.js + Express', desc: 'Backend API' },
  { icon: '🍃', name: 'MongoDB', desc: 'Database' },
  { icon: '⚡', name: 'Socket.io', desc: 'Real-time multiplayer' },
  { icon: '🤖', name: 'Groq AI (Llama)', desc: 'AI question generation' },
  { icon: '🔐', name: 'Google OAuth', desc: 'Authentication' },
];

const About = () => {
  return (
    <div className="page">
      <div className="container-sm">
        <div className="about-hero card animate-bounceIn">
          <div className="about-avatar-wrap">
            {DEVELOPER.avatar ? (
              <img src={DEVELOPER.avatar} alt={DEVELOPER.name} className="about-avatar" />
            ) : (
              <div className="about-avatar placeholder">
                {DEVELOPER.name.charAt(0)}
              </div>
            )}
            <div className="about-badge">
              <Code size={14} /> Developer
            </div>
          </div>

          <div className="about-identity">
            <div className="section-eyebrow">About the Creator</div>
            <h1 className="about-name">{DEVELOPER.name}</h1>
            <p className="about-title">{DEVELOPER.title}</p>
            <p className="about-bio">{DEVELOPER.bio}</p>

            <div className="about-socials">
              {DEVELOPER.social.github && (
                <a href={DEVELOPER.social.github} target="_blank" rel="noreferrer" className="about-social-btn">
                  <Github size={18} /> GitHub
                </a>
              )}
              {DEVELOPER.social.linkedin && (
                <a href={DEVELOPER.social.linkedin} target="_blank" rel="noreferrer" className="about-social-btn">
                  <Linkedin size={18} /> LinkedIn
                </a>
              )}
              {DEVELOPER.social.website && (
                <a href={DEVELOPER.social.website} target="_blank" rel="noreferrer" className="about-social-btn">
                  <Globe size={18} /> Portfolio
                </a>
              )}
              {DEVELOPER.email && (
                <a href={`mailto:${DEVELOPER.email}`} className="about-social-btn">
                  <Mail size={18} /> Email
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="about-section animate-slideUp">
          <div className="section-eyebrow">Technical Skills</div>
          <h2 style={{ marginBottom: 16 }}>Tech I Work With</h2>
          <div className="skills-grid">
            {DEVELOPER.skills.map((skill, i) => (
              <span key={i} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>

        <div className="about-section animate-fadeIn">
          <div className="section-eyebrow">Built With</div>
          <h2 style={{ marginBottom: 20 }}>QuizMaster AI Stack</h2>
          <div className="stack-grid">
            {techStack.map((tech, i) => (
              <div key={i} className="stack-card">
                <div className="stack-icon">{tech.icon}</div>
                <div className="stack-name">{tech.name}</div>
                <div className="stack-desc">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="about-features card animate-fadeIn">
          <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--gray-200)' }}>
            <div className="section-eyebrow">Features</div>
            <h2 style={{ margin: 0 }}>What QuizMaster AI Offers</h2>
          </div>
          <div style={{ padding: '20px 28px' }}>
            {[
              ['🤖', 'AI Question Generation', 'Generates MCQs dynamically using Groq AI on any topic'],
              ['📄', 'PDF Upload', 'Upload a PDF and quiz yourself on its content'],
              ['🎮', 'Real-Time Multiplayer', 'Up to 4 players compete in the same room via Socket.io'],
              ['👑', 'Host Controls', 'Set difficulty, time limits, number of questions'],
              ['📊', 'Live Scoreboard', 'See scores update in real time during the game'],
              ['🏆', 'Global Leaderboard', 'Track your rank among all players'],
              ['📈', 'Performance Analytics', 'View accuracy, win rate, and history per game'],
              ['🎉', 'Confetti & Sound', 'Win effects with speed-bonus scoring system'],
            ].map(([icon, title, desc], i) => (
              <div key={i} className="feature-row">
                <div className="feature-row-icon">{icon}</div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--gray-900)', marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="about-footer animate-fadeIn">
          <Heart size={16} fill="var(--error)" color="var(--error)" />
          <span>Built with passion by Sarthak Mishra using MERN stack + Socket.io + Groq AI</span>
          <Zap size={16} fill="var(--blue-500)" color="var(--blue-500)" />
        </div>
      </div>
    </div>
  );
};

export default About;