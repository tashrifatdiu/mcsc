import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import './ImageLightbox.css';

export default function ImageLightbox({ images, currentIndex, onClose, onNext, onPrev }) {
  useEffect(() => {
    // Prevent body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrev]);

  // Touch handling
  const [touchStart, setTouchStart] = React.useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        onNext();
      } else {
        onPrev();
      }
    }
  };

  return (
    <div className="image-lightbox-overlay" onClick={onClose}>
      <button className="lightbox-btn-close" onClick={onClose}>
        <X size={28} />
      </button>

      <div className="lightbox-counter-display">
        {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
      </div>

      <div 
        className="lightbox-content"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img 
          src={images[currentIndex]} 
          alt={`Image ${currentIndex + 1}`}
          className="lightbox-image"
        />
      </div>

      <div className="lightbox-controls">
        <button className="lightbox-btn-nav" onClick={(e) => { e.stopPropagation(); onPrev(); }}>
          <ChevronLeft size={28} />
        </button>
        <button className="lightbox-btn-nav" onClick={(e) => { e.stopPropagation(); onNext(); }}>
          <ChevronRight size={28} />
        </button>
      </div>

      <div className="lightbox-swipe-hint">← Swipe →</div>
    </div>
  );
}
