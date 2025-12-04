import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import './PastEventsNew.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function PastEventsNew() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/events?status=past`);
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data.events || []);
      } else {
        setError(data.error || 'Failed to load events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
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

  if (loading) {
    return (
      <div className="events-new-loading">
        <div className="spinner-new"></div>
        <p>Loading Events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-new-error">
        <p>{error}</p>
        <button onClick={fetchEvents} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="events-new-page">
      <div className="events-new-header">
        <h1>Past Events</h1>
        <p>Celebrating our achievements and memorable moments</p>
      </div>

      <div className="events-new-container">
        {events.length === 0 ? (
          <div className="no-events">
            <p>No past events found</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <div
                key={event._id}
                className="event-card-new"
                onClick={() => navigate(`/events/${event.slug}`)}
              >
                <div className="event-image">
                  <img src={event.coverImage} alt={event.title} loading="lazy" />
                  <div className="event-overlay"></div>
                </div>
                <div className="event-info">
                  <h3>{event.title}</h3>
                  <p className="event-description">{event.shortDescription}</p>
                  <div className="event-meta">
                    <span><Calendar size={16} /> {formatDate(event.date)}</span>
                    <span><MapPin size={16} /> {event.location}</span>
                  </div>
                  <button className="view-btn">
                    View Details <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
