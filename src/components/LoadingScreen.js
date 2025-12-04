import React from 'react';
import './LoadingScreen.css';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="loading-screen">
      <div className="loading-screen-content">
        <div className="logo-container">
          <img src="/mcsclogo.ico" alt="MCSC Logo" className="loading-logo" />
          <div className="loading-ring"></div>
          <div className="loading-ring-2"></div>
        </div>
        <h2 className="loading-message">{message}</h2>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
      <div className="loading-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
    </div>
  );
}
