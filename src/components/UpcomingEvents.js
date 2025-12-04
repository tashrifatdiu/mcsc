import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function UpcomingEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/events/upcoming`);
      const data = await response.json();
      
      if (response.ok) {
        // Show only first 3 events
        setEvents((data.events || []).slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching upcoming events:', err);
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
    <div className="home-section" aria-labelledby="events-heading">
      <div className="section-title">
        <div className="kicker">Events</div>
        <h2 id="events-heading">Upcoming events</h2>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Loading events...
        </div>
      )}

      {!loading && events.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          No upcoming events scheduled
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="events-grid" style={{ marginTop: 12 }}>
          {events.map((e) => (
            <div key={e._id} className="event">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{e.title}</h3>
                  <div className="small-muted" style={{ color: 'var(--text-muted)' }}>{e.location}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatDate(e.date)}</div>
                  <div className="small-muted" style={{ color: 'var(--text-muted)' }}>Date</div>
                </div>
              </div>
              <p className="small-muted" style={{ marginTop: 10, color: 'var(--text-secondary)' }}>
                {e.shortDescription}
              </p>
              <div style={{ marginTop: 10 }}>
                <button 
                  onClick={() => navigate(`/events/${e.slug || e._id}`)}
                  style={{ 
                    padding:'8px 12px', 
                    borderRadius:8, 
                    border:'1px solid var(--border-medium)', 
                    background:'var(--bg-tertiary)', 
                    color:'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(el) => el.target.style.background = 'var(--bg-card-hover)'}
                  onMouseOut={(el) => el.target.style.background = 'var(--bg-tertiary)'}
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && events.length > 0 && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/events/future')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              background: 'var(--accent-primary)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(el) => el.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(el) => el.target.style.transform = 'translateY(0)'}
          >
            View All Upcoming Events
          </button>
        </div>
      )}
    </div>
  );
}
