import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, ChevronLeft, ChevronRight, X } from 'lucide-react';
import './EventDetailNew.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function EventDetailNew() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [visibleImages, setVisibleImages] = useState(6);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

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

  const openLightbox = (index) => {
    setSelectedImage(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = '';
  };

  const nextImage = () => {
    if (event?.images) {
      setSelectedImage((prev) => (prev + 1) % event.images.length);
    }
  };

  const prevImage = () => {
    if (event?.images) {
      setSelectedImage((prev) => (prev - 1 + event.images.length) % event.images.length);
    }
  };

  if (loading) {
    return (
      <div className="event-new-loading">
        <div className="spinner-new"></div>
        <p>Loading Event...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-new-error">
        <h1>404</h1>
        <p>{error || 'Event not found'}</p>
        <button onClick={() => navigate('/events/past')} className="btn-back">
          <ArrowLeft size={20} />
          Back to Events
        </button>
      </div>
    );
  }

  const imagesToShow = event.images?.slice(0, visibleImages) || [];
  const hasMore = event.images?.length > visibleImages;

  return (
    <div className="event-new-page">
      {/* Simple Header */}
      <div className="event-new-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={24} />
        </button>
        <img src={event.coverImage} alt={event.title} className="cover-image" />
        <div className="header-overlay"></div>
        <div className="header-content">
          <h1>{event.title}</h1>
          <p className="subtitle">{event.shortDescription}</p>
          <div className="meta-info">
            <span><Calendar size={18} /> {formatDate(event.date)}</span>
            <span><MapPin size={18} /> {event.location}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="event-new-content">
        <section className="description-section">
          <h2>About This Event</h2>
          <p>{event.description}</p>
        </section>

        {/* Gallery */}
        {event.images && event.images.length > 0 && (
          <section className="gallery-section">
            <h2>Event Gallery ({event.images.length} Photos)</h2>
            <div className="simple-gallery">
              {imagesToShow.map((image, index) => (
                <div
                  key={index}
                  className="gallery-card"
                  onClick={() => openLightbox(index)}
                >
                  <img src={image} alt={`Photo ${index + 1}`} loading="lazy" />
                  <div className="image-number">{index + 1}</div>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <button 
                className="load-more-button"
                onClick={() => setVisibleImages(prev => prev + 6)}
              >
                Load More ({event.images.length - visibleImages} remaining)
              </button>
            )}
          </section>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage !== null && event.images && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <X size={32} />
          </button>
          <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
            <ChevronLeft size={32} />
          </button>
          <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
            <ChevronRight size={32} />
          </button>
          <div className="lightbox-counter">
            {selectedImage + 1} / {event.images.length}
          </div>
          <img 
            src={event.images[selectedImage]} 
            alt={`Photo ${selectedImage + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
