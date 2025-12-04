import React, { useEffect, useState } from 'react';
import './Team.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoreMembers();
  }, []);

  const fetchCoreMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/core-members`);
      const data = await response.json();
      
      if (response.ok) {
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error('Error fetching core members:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="home-section team-section" aria-labelledby="team-heading">
      <div className="section-title">
        <div className="kicker">Leadership</div>
        <h2 id="team-heading">Core Team</h2>
      </div>

      <p className="team-intro">
        The guiding force behind Milestone College Science Club's success and vision.
      </p>

      {loading && (
        <div className="team-loading">
          <div className="loading-spinner"></div>
          <p>Loading team members...</p>
        </div>
      )}

      {!loading && members.length === 0 && (
        <div className="team-empty">
          <p>No team members found.</p>
        </div>
      )}

      {!loading && members.length > 0 && (
        <div className="core-team-grid">
          {members.map((member) => (
            <div key={member._id} className="core-member-card">
              <div className="core-member-image">
                {member.image ? (
                  <img src={member.image} alt={member.name} />
                ) : (
                  <div className="core-member-placeholder">
                    <span>{getInitials(member.name)}</span>
                  </div>
                )}
              </div>
              
              <div className="core-member-info">
                <h3 className="core-member-name">{member.name}</h3>
                <p className="core-member-role">{member.role}</p>
                <p className="core-member-designation">{member.designation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
