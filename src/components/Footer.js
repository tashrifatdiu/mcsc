import React from 'react';

const styles = `
  .footer {
    position: relative;
    overflow: hidden;
    background: var(--bg-secondary);
    transition: background 0.3s ease;
  }

  [data-theme="dark"] .footer {
    background: linear-gradient(to right, #020617, #0f172a, #020617);
  }

  [data-theme="light"] .footer {
    background: linear-gradient(to right, #f8fafc, #ffffff, #f8fafc);
  }

  .background-glow {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .glow-1 {
    position: absolute;
    top: 0;
    left: 25%;
    width: 384px;
    height: 384px;
    background: rgba(34, 211, 238, 0.1);
    border-radius: 50%;
    filter: blur(120px);
    animation: pulse 4s ease-in-out infinite;
  }

  .glow-2 {
    position: absolute;
    bottom: 0;
    right: 25%;
    width: 384px;
    height: 384px;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 50%;
    filter: blur(120px);
    animation: pulse 4s ease-in-out infinite;
    animation-delay: 1s;
  }

  .glow-3 {
    position: absolute;
    top: 50%;
    right: 0;
    width: 384px;
    height: 384px;
    background: rgba(147, 51, 234, 0.05);
    border-radius: 50%;
    filter: blur(120px);
    animation: pulse 4s ease-in-out infinite;
    animation-delay: 2s;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .footer-content {
    position: relative;
    z-index: 10;
    max-width: 1200px;
    margin: 0 auto;
    padding: 64px 24px;
  }

  .footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 48px;
    margin-bottom: 48px;
    align-items: start;
  }

  .footer-section h3 {
    font-size: 18px;
    font-weight: bold;
    background: linear-gradient(to right, var(--accent-info), var(--accent-primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .zap-icon {
    width: 20px;
    height: 20px;
    color: #22d3ee;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: linear-gradient(to right, #22d3ee, #60a5fa);
    display: inline-block;
  }

  .contact-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .contact-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    background: var(--bg-card);
    border: 1px solid var(--border-medium);
    text-decoration: none;
    color: var(--text-secondary);
    transition: all 0.3s ease;
    font-size: 14px;
  }

  .contact-link:hover {
    color: var(--text-primary);
  }

  .instagram-link:hover {
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2));
    border-color: rgba(236, 72, 153, 0.5);
  }

  .email-link:hover {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(249, 115, 22, 0.2));
    border-color: rgba(239, 68, 68, 0.5);
  }

  .facebook-link:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(34, 211, 238, 0.2));
    border-color: rgba(59, 130, 246, 0.5);
  }

  .icon-instagram {
    color: #ec4899;
    transition: transform 0.3s ease;
  }

  .icon-email {
    color: #ef4444;
    transition: transform 0.3s ease;
  }

  .icon-facebook {
    color: #3b82f6;
    transition: transform 0.3s ease;
  }

  .contact-link:hover .icon-instagram,
  .contact-link:hover .icon-email,
  .contact-link:hover .icon-facebook {
    transform: scale(1.1);
  }

  .contact-text {
    transition: color 0.3s ease;
  }

  .about-section {
    display: flex;
    flex-direction: column;
  }

  .about-section p {
    color: var(--text-secondary);
    line-height: 1.6;
    font-size: 14px;
    margin-bottom: 20px;
  }

  .footer-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-top: 20px;
  }

  .footer-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border-medium);
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .footer-stat:hover {
    transform: translateY(-2px);
    border-color: var(--accent-primary);
  }

  .footer-stat strong {
    font-size: 24px;
    font-weight: 900;
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .footer-stat span {
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .brand-section {
    text-align: right;
  }

  .brand-card {
    display: inline-block;
    background: linear-gradient(to right, rgba(34, 211, 238, 1), rgba(59, 130, 246, 1));
    padding: 2px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .brand-inner {
    background: var(--bg-primary);
    padding: 8px 16px;
    border-radius: 6px;
  }

  .brand-inner p:first-child {
    font-size: 12px;
    background: linear-gradient(to right, var(--accent-info), var(--accent-primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .brand-inner p:last-child {
    font-size: 18px;
    font-weight: bold;
    color: var(--text-primary);
  }

  .divider {
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(34, 211, 238, 0.5), transparent);
    margin: 32px 0;
  }

  .footer-bottom {
    display: flex;
    flex-direction: column;
    gap: 16px;
    text-align: center;
    font-size: 12px;
    color: var(--text-muted);
  }

  @media (min-width: 768px) {
    .footer-grid {
      grid-template-columns: 1fr 1fr 1fr;
    }

    .footer-bottom {
      flex-direction: row;
      justify-content: space-between;
      text-align: left;
    }
  }

  .footer-links {
    display: flex;
    gap: 24px;
    justify-content: center;
  }

  @media (min-width: 768px) {
    .footer-links {
      justify-content: flex-end;
    }
  }

  .footer-links a {
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .footer-links a:hover {
    color: var(--accent-info);
  }

  .footer-glow {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, transparent, #22d3ee, transparent);
    opacity: 0.3;
  }

  .privacy-terms {
    margin-top: 16px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .privacy-terms p {
    margin: 4px 0;
  }
`;

export default function Footer() {
  return (
    <>
      <style>{styles}</style>
      <footer className="footer">
        <div className="background-glow">
          <div className="glow-1"></div>
          <div className="glow-2"></div>
          <div className="glow-3"></div>
        </div>

        <div className="footer-content">
          <div className="footer-grid">
            {/* Connect Section */}
            <div className="footer-section">
              <h3>
                <svg className="icon zap-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                Connect With Us
              </h3>

              <div className="contact-list">
                <a href="https://www.instagram.com/scienceclub_mc" target="_blank" rel="noopener noreferrer" className="contact-link instagram-link">
                  <svg className="icon icon-instagram" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="1"></circle>
                  </svg>
                  <span className="contact-text">scienceclub_mc</span>
                </a>

                <a href="mailto:scienceclubmilestonecollege@gmail.com" className="contact-link email-link">
                  <svg className="icon icon-email" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  <span className="contact-text">Email</span>
                </a>

                <a href="https://www.facebook.com/profile.php?id=100063111137461" target="_blank" rel="noopener noreferrer" className="contact-link facebook-link">
                  <svg className="icon icon-facebook" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                  </svg>
                  <span className="contact-text">Science Club</span>
                </a>
              </div>
            </div>

            {/* About Section */}
            <div className="footer-section about-section">
              <h3>
                <span className="dot"></span>
                About
              </h3>
              <p>Science Club at Milestone College - fostering curiosity, innovation, and discovery since 2010.</p>
              <div className="footer-stats">
                <div className="footer-stat">
                  <strong>1000+</strong>
                  <span>Active Members</span>
                </div>
                <div className="footer-stat">
                  <strong>6000+</strong>
                  <span>Alumni Worldwide</span>
                </div>
              </div>
            </div>

            {/* Brand Section */}
            <div className="footer-section brand-section">
              <div className="brand-card">
                <div className="brand-inner">
                  <p>Created by</p>
                  <p>MCSC</p>
                </div>
              </div>
            </div>
          </div>
                
          <div className="divider"></div>

          {/* Bottom Section */}
          <div className="footer-bottom">
            <div><p>© 2024 Science Club. All rights reserved.</p></div>
            
            <div className="footer-links">
              <a href="/admin/login">Admin</a>
            </div>

            <div className="privacy-terms">
              <p>Privacy: We ensure that all member data is kept confidential and used solely for club purposes.</p>
              <p>Terms: Participation in club activities requires adherence to our code of conduct and respect for all members.</p>
            </div>
          </div>
        </div>

        <div className="footer-glow"></div>
      </footer>
    </>
  );
}