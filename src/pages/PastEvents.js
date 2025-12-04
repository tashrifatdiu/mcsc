import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Zap } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './EventsPages.css';
import './PastEvents.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function PastEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
    fetchPastEvents();
  }, []);

  const fetchPastEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/events/past`);
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data.events || []);
      } else {
        setError(data.error || 'Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching past events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="events-page" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-32 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="events-container">
        <div className="events-header" data-aos="fade-up">
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient">
            PAST EVENTS
          </h1>
          <p className="text-2xl mt-6 font-light tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Where legends were made
          </p>
          <div className="mt-4 flex justify-center">
            <Zap className="w-12 h-12 text-cyan-400 animate-bounce" />
          </div>
        </div>

        {loading && <LoadingScreen message="Loading Past Events..." />}

        {error && (
          <div className="text-center py-20">
            <p className="text-xl text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl" style={{ color: 'var(--text-muted)' }}>No past events found</p>
          </div>
        )}

        <div className="events-grid">
          {events.map((event, i) => (
            <div
              key={event._id}
              data-aos="fade-up"
              data-aos-delay={i * 150}
              className="event-card-wrapper"
              onClick={() => navigate(`/events/${event.slug || event._id}`)}
            >
              <div className="event-card-3d">
                <div className={`event-card-glow bg-gradient-to-br ${event.color}`}></div>
                
                <div className="event-card">
                  <div className="event-card-image">
                    <img src={event.coverImage} alt={event.title} />
                    <div className="event-card-overlay"></div>
                    
                    <div className="event-card-badge">
                      <span>{event.images?.length || 0} PHOTOS</span>
                    </div>
                  </div>

                  <div className="event-card-content">
                    <h3 className={`event-card-title bg-gradient-to-r ${event.color} bg-clip-text text-transparent`}>
                      {event.title}
                    </h3>
                    <p className="event-card-short">{event.shortDescription}</p>
                    <p className="event-card-description">{event.description}</p>

                    <div className="event-card-footer">
                      <div className="event-card-meta">
                        <span className="event-card-meta-item">
                          <Calendar size={16} /> 
                          {formatDate(event.date)}
                        </span>
                        <span className="event-card-meta-item">
                          <MapPin size={16} /> 
                          {event.location}
                        </span>
                      </div>
                      <ArrowRight className="event-card-arrow" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
