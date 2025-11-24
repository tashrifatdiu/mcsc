import React from 'react';

const styles = `
  .footer {
    position: relative;
    overflow: hidden;
    background: linear-gradient(to right, #020617, #0f172a, #020617);
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
    background: linear-gradient(to right, #22d3ee, #60a5fa);
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
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    text-decoration: none;
    color: rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
    font-size: 14px;
  }

  .contact-link:hover {
    color: white;
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
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.6;
    font-size: 14px;
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
    background: #0f172a;
    padding: 8px 16px;
    border-radius: 6px;
  }

  .brand-inner p:first-child {
    font-size: 12px;
    background: linear-gradient(to right, #22d3ee, #60a5fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .brand-inner p:last-child {
    font-size: 18px;
    font-weight: bold;
    color: white;
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
    color: rgba(255, 255, 255, 0.5);
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
    color: rgba(255, 255, 255, 0.5);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .footer-links a:hover {
    color: #22d3ee;
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
    color: rgba(255, 255, 255, 0.7);
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
              <p>Science Club at Milestone College - fostering curiosity, innovation, and discovery through collaborative scientific exploration.</p>
            </div>

            {/* Brand Section */}
            <div className="footer-section brand-section">
              <div className="brand-card">
                <div className="brand-inner">
                  <p>Powered by</p>
                  <p>Midenus</p>
                </div>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          {/* Bottom Section */}
          <div className="footer-bottom">
            <div><p>© 2024 Science Club. All rights reserved.</p></div>
            
           

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