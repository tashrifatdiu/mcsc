import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Sparkles } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './EventsPages.css';
import './FutureEvents.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function FutureEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/events/upcoming`);
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data.events || []);
      } else {
        setError(data.error || 'Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching upcoming events:', err);
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

  const getDaysUntil = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="events-page" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 left-32 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="events-container">
        <div className="events-header" data-aos="fade-up">
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 animate-gradient">
            UPCOMING EVENTS
          </h1>
          <p className="text-2xl mt-6 font-light tracking-wide" style={{ color: 'var(--text-muted)' }}>
            The future awaits
          </p>
          <div className="mt-4 flex justify-center">
            <Sparkles className="w-12 h-12 text-green-400 animate-bounce" />
          </div>
        </div>

        {loading && <LoadingScreen message="Loading Upcoming Events..." />}

        {error && (
          <div className="text-center py-20">
            <p className="text-xl text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl" style={{ color: 'var(--text-muted)' }}>No upcoming events scheduled</p>
          </div>
        )}

        <div className="events-grid">
          {events.map((event, i) => {
            const daysUntil = getDaysUntil(event.date);
            
            return (
              <div
                key={event._id}
                data-aos="fade-up"
                data-aos-delay={i * 150}
                className="future-event-card-wrapper"
                onClick={() => navigate(`/events/${event.slug || event._id}`)}
              >
                <div className="future-event-card-3d">
                  <div className={`future-event-card-glow bg-gradient-to-br ${event.color}`}></div>
                  
                  <div className="future-event-card">
                    <div className="future-event-card-image">
                      <img src={event.coverImage} alt={event.title} />
                      <div className="future-event-card-overlay"></div>
                      
                      <div className="future-event-countdown">
                        <Clock size={16} />
                        <span>{daysUntil > 0 ? `${daysUntil} DAYS` : daysUntil === 0 ? 'TODAY' : 'PAST'}</span>
                      </div>
                    </div>

                    <div className="future-event-card-content">
                      <h3 className={`future-event-card-title bg-gradient-to-r ${event.color} bg-clip-text text-transparent`}>
                        {event.title}
                      </h3>
                      <p className="future-event-card-short">{event.shortDescription}</p>
                      <p className="future-event-card-description">{event.description}</p>

                      <div className="future-event-card-meta">
                        <div className="future-event-meta-item">
                          <Calendar size={16} style={{ color: '#22c55e' }} />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="future-event-meta-item">
                          <MapPin size={16} style={{ color: '#3b82f6' }} />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <button className="future-event-btn">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
