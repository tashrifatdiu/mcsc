import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import './JournalContributors.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function JournalContributors() {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContributors();
  }, []);

  const fetchContributors = async () => {
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/journal/contributors`);
      const data = await res.json();
      setContributors(data.contributors || []);
    } catch (err) {
      console.error('Failed to fetch contributors', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="contributors-section">
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading contributors...</p>
      </div>
    );
  }

  if (contributors.length === 0) {
    console.log('No contributors found');
    return null;
  }

  console.log('Contributors loaded:', contributors);

  return (
    <div className="contributors-section">
      <div className="contributors-header">
        <Users size={24} />
        <h3>Special Thanks</h3>
      </div>
      <p className="contributors-subtitle">
        We extend our heartfelt gratitude to these amazing individuals who helped bring the journal section to life
      </p>
      
      <div className="contributors-grid">
        {contributors.map((contributor, index) => (
          <div key={index} className="contributor-card">
            <div className="contributor-avatar">
              {contributor.profileImage ? (
                <img src={contributor.profileImage} alt={contributor.name} />
              ) : (
                <div className="avatar-placeholder">
                  {contributor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="contributor-info">
              <h4 className="contributor-name">{contributor.name}</h4>
              <div className="contributor-details">
                <span className="detail-badge">Code: {contributor.code}</span>
                <span className="detail-badge">Class {contributor.class}{contributor.section}</span>
              </div>
              <p className="contributor-building">{contributor.building}</p>
              <div className="contributor-role">{contributor.role}</div>
              <p className="contributor-contribution">{contributor.contribution}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
