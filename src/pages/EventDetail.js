import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, MapPin, X, ZoomIn, ArrowLeft } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './EventDetail.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    AOS.init({ 
      duration: 600,
      once: true,
      offset: 50,
      delay: 0,
      easing: 'ease-out'
    });
  }, []);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!isGalleryOpen) return;
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'Escape') setIsGalleryOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isGalleryOpen, currentIndex]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/events/${eventId}`);
      const data = await response.json();
      
      if (response.ok) {
        setEvent(data.event);
      } else {
        setError(data.error || 'Event not found');
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Failed to load event');
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

  const nextImage = () => {
    if (!event?.images) return;
    setCurrentIndex((i) => (i + 1) % event.images.length);
  };

  const prevImage = () => {
    if (!event?.images) return;
    setCurrentIndex((i) => (i - 1 + event.images.length) % event.images.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    
    // Only swipe if horizontal movement is greater than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      diffX > 0 ? nextImage() : prevImage();
    }
  };

  const openGallery = (index) => {
    setCurrentIndex(index);
    setIsGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    document.body.style.overflow = '';
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (loading) {
    return (
      <div className="event-loading">
        <div className="loading-content">
          <div className="logo-container">
            <img src="/mcsclogo.ico" alt="MCSC Logo" className="loading-logo" />
            <div className="loading-ring"></div>
          </div>
          <h2>Loading Event...</h2>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-error">
        <div className="error-content">
          <h1>404</h1>
          <p>{error || 'Event not found'}</p>
          <button onClick={() => navigate('/events/past')} className="error-btn">
            <ArrowLeft size={20} />
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      {/* Hero Section */}
      <div className="event-hero">
        <div className="hero-bg">
          <img src={event.coverImage} alt={event.title} />
          <div className="hero-overlay"></div>
          <div className={`hero-gradient ${event.color}`}></div>
        </div>

        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={24} />
        </button>

        <div className="hero-content" data-aos="fade-up">
          <h1>{event.title}</h1>
          <p className="hero-subtitle">{event.shortDescription}</p>
          <div className="hero-meta">
            <span className="meta-item">
              <Calendar size={20} />
              {formatDate(event.date)}
            </span>
            <span className="meta-item">
              <MapPin size={20} />
              {event.location}
            </span>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="event-description">
        <div className="container">
          <div className="description-card" data-aos="fade-up">
            <h2>About This Event</h2>
            <p>{event.description}</p>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      {event.images && event.images.length > 0 && (
        <div className="event-gallery-section">
          <div className="container">
            <h2 className="gallery-title" data-aos="fade-up">Event Gallery</h2>
            
            <div className="gallery-grid">
              {event.images.map((image, index) => (
                <div
                  key={index}
                  className="gallery-item"
                  data-aos="zoom-in"
                  data-aos-delay={index * 50}
                  onClick={() => openGallery(index)}
                >
                  <img src={image} alt={`Gallery ${index + 1}`} />
                  <div className="gallery-overlay">
                    <ZoomIn size={40} />
                    <span className="gallery-number">{index + 1}/{event.images.length}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Gallery Modal */}
      {isGalleryOpen && event.images && (
        <div className="gallery-modal">
          <button onClick={closeGallery} className="modal-close">
            <X size={28} />
          </button>

          <div className="modal-counter">
            {String(currentIndex + 1).padStart(2, '0')} / {String(event.images.length).padStart(2, '0')}
          </div>

          <div
            className="modal-image-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              key={currentIndex}
              src={event.images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="modal-image"
            />
          </div>

          <div className="modal-nav">
            <button onClick={prevImage} className="nav-btn nav-prev">
              <ChevronLeft size={32} />
            </button>
            <button onClick={nextImage} className="nav-btn nav-next">
              <ChevronRight size={32} />
            </button>
          </div>

          <div className="swipe-hint">
            <span>← Swipe →</span>
          </div>
        </div>
      )}
    </div>
  );
}
