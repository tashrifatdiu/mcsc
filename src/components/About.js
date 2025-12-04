import React from 'react';
import './About.css';

export default function About() {
  return (
    <div className="home-section about-section" aria-labelledby="about-heading">
      <div className="section-title">
        <div className="kicker">About</div>
        <h2 id="about-heading">Who we are</h2>
      </div>

      <p className="about-intro">
        Milestone College Science Club (MCSC) is a student-led community that cultivates curiosity and hands-on learning.
        We organize workshops, competitions, and science communication activities to empower students across grades 9–12.
      </p>

      <div className="about-content">
        <div className="about-description">
          <p>
            Our mission is to make science accessible and exciting. We host regular sessions on physics, chemistry, biology,
            robotics, and science journalism. Members get opportunities to collaborate on projects, present at club showcases,
            and participate in inter-college events.
          </p>

          <ul className="about-features">
            <li>Hands-on workshops and lab sessions</li>
            <li>Project mentorship and showcase events</li>
            <li>Science communication & journal club</li>
            <li>Competitions & community outreach</li>
          </ul>
        </div>

        <div className="about-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div className="stat-number">1000+</div>
            <div className="stat-label">Active Members</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🌍</div>
            <div className="stat-number">6000+</div>
            <div className="stat-label">Alumni Worldwide</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-number">2010</div>
            <div className="stat-label">Established</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-number">15+</div>
            <div className="stat-label">Years of Excellence</div>
          </div>
        </div>
      </div>
    </div>
  );
}
