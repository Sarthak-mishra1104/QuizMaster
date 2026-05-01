import React from 'react';
import { Github, Linkedin, Globe, Mail, Heart, Zap } from 'lucide-react';
import './About.css';

const DEVELOPER = {
  name: 'Sarthak Mishra',
  title: 'Full Stack Developer',
  bio: `I'm a passionate Full Stack Developer who loves building scalable web applications and AI-powered tools. I specialize in the MERN stack and enjoy creating seamless user experiences.`,
  avatar: 'https://raw.githubusercontent.com/Sarthak-mishra1104/QuizMaster/main/client/src/pages/profile.jpeg',
  email: 'sarthakmishra.2431078@gmail.com',
  social: {
    github: 'https://github.com/Sarthak-mishra1104',
    linkedin: 'https://linkedin.com/in/sarthak-mishra-1a8041306',
    website: 'https://my-portfolio-q2yv.vercel.app',
  },
};

const About = () => {
  return (
    <div className="page">
      <div className="container-sm">
        <div className="about-hero card animate-bounceIn">
          <div className="about-avatar-wrap">
            <img src={DEVELOPER.avatar} alt={DEVELOPER.name} className="about-avatar" />
          </div>

          <div className="about-identity">
            <div className="section-eyebrow">About the Developer</div>
            <h1 className="about-name">{DEVELOPER.name}</h1>
            <p className="about-title">{DEVELOPER.title}</p>
            <p className="about-bio">{DEVELOPER.bio}</p>

            <div className="about-socials">
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