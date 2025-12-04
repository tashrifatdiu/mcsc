import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function PastCoverage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPastEvents();
  }, []);

  const fetchPastEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/events/past`);
      const data = await response.json();
      
      if (response.ok) {
        // Show only first 3 events
        setEvents((data.events || []).slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching past events:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="home-section" aria-labelledby="past-heading">
      <div className="section-title">
        <div className="kicker">Events</div>
        <h2 id="past-heading">Past Events</h2>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Loading events...
        </div>
      )}

      {!loading && events.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          No past events found
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="coverage-list" style={{ marginTop: 12 }}>
          {events.map((e) => (
            <div 
              key={e._id} 
              className="coverage-item"
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => navigate(`/events/${e.slug || e._id}`)}
              onMouseOver={(el) => el.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseOut={(el) => el.currentTarget.style.background = 'transparent'}
            >
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>{e.title}</strong>
                <div className="small-muted" style={{ color: 'var(--text-muted)' }}>
                  {e.location} • {formatDate(e.date)}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>View →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && events.length > 0 && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/events/past')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              background: 'var(--accent-secondary)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(el) => el.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(el) => el.target.style.transform = 'translateY(0)'}
          >
            View All Past Events
          </button>
        </div>
      )}
    </div>
  );
}
