import React from 'react';
import { Github, Linkedin, Globe, Mail, Heart, Zap } from 'lucide-react';
import './About.css';

const DEVELOPER = {
  name: 'Sarthak Mishra',
  title: 'Full Stack Developer',
  bio: `I'm a passionate Full Stack Developer who loves building scalable web applications and AI-powered tools. I specialize in the MERN stack and enjoy creating seamless user experiences that are both technically solid and a joy to use.`,
  email: 'sarthakmishra.2431078@gmail.com',
  social: {
    github: 'https://github.com/Sarthak-mishra1104',
    linkedin: 'https://linkedin.com/in/sarthak-mishra-1a8041306',
    website: 'https://my-portfolio-q2yv.vercel.app',
  },
};

const features = [
  { icon: '🤖', title: 'AI Question Generation', desc: 'Generates MCQs dynamically on any topic using Groq AI' },
  { icon: '📄', title: 'PDF Upload', desc: 'Upload study material and quiz yourself on its content' },
  { icon: '🎮', title: 'Real-Time Multiplayer', desc: 'Compete with up to 50 players in the same room' },
  { icon: '👨‍🏫', title: 'Teacher Mode', desc: 'Create, review and publish quizzes for your students' },
  { icon: '🎓', title: 'Student Mode', desc: 'Join quizzes by code, select grade and subject' },
  { icon: '🏆', title: 'Live Leaderboard', desc: 'Real-time rankings with score and accuracy tracking' },
  { icon: '📊', title: 'Performance Analytics', desc: 'Track accuracy, wins, and score history per game' },
  { icon: '⚡', title: 'Speed Bonus', desc: 'Faster correct answers earn extra bonus points' },
];

const About = () => {
  return (
    <div className="page">
      <div className="container-sm">

        {/* Developer Card */}
        <div className="about-hero card animate-bounceIn">
          <div className="about-identity" style={{ textAlign: 'center', width: '100%' }}>
            <div className="section-eyebrow">About the Developer</div>
            <h1 className="about-name">{DEVELOPER.name}</h1>
            <p className="about-title">{DEVELOPER.title}</p>
            <p className="about-bio" style={{ maxWidth: 480, margin: '0 auto 20px' }}>{DEVELOPER.bio}</p>

            <div className="about-socials" style={{ justifyContent: 'center' }}>
              <a href={DEVELOPER.social.github} target="_blank" rel="noreferrer" className="about-social-btn">
                <Github size={18} /> GitHub
              </a>
              <a href={DEVELOPER.social.linkedin} target="_blank" rel="noreferrer" className="about-social-btn">
                <Linkedin size={18} /> LinkedIn
              </a>
              <a href={DEVELOPER.social.website} target="_blank" rel="noreferrer" className="about-social-btn">
                <Globe size={18} /> Portfolio
              </a>
              <a href={`mailto:${DEVELOPER.email}`} className="about-social-btn">
                <Mail size={18} /> Email
              </a>
            </div>
          </div>
        </div>

        {/* App Features */}
        <div className="about-features card animate-fadeIn" style={{ marginTop: 24 }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--gray-200)' }}>
            <div className="section-eyebrow">Features</div>
            <h2 style={{ margin: 0 }}>What QuizMaster AI Offers</h2>
          </div>
          <div style={{ padding: '20px 28px' }}>
            {features.map(([icon, title, desc], i) => (
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
          <span>Built with passion by Sarthak Mishra</span>
          <Zap size={16} fill="var(--blue-500)" color="var(--blue-500)" />
        </div>
      </div>
    </div>
  );
};

export default About;