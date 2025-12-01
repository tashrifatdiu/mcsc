// src/pages/EventDetail.jsx (Final Swipe Gallery – Clean & Perfect)
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import EVENTS from '../data/events';
import AOS from 'aos';

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const event = EVENTS.find(e => e.id === eventId);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    AOS.init({ duration: 800 });
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (!event) return <div className="min-h-screen bg-black flex-center text-6xl text-white">404</div>;

  const nextImage = () => setIndex((i) => (i + 1) % event.images.length);
  const prevImage = () => setIndex((i) => (i - 1 + event.images.length) % event.images.length);

  const handleTouchStart = (e) => touchStartX.current = e.touches[0].clientX;
  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextImage() : prevImage();
  };

  return (
    <>
      {/* Hero */}
      <div className="relative h-screen overflow-hidden">
        <img src={`/images/${event.cover}`} className="absolute inset-0 w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className={`absolute inset-0 bg-gradient-to-br ${event.color} opacity-30`} />

        <div className="relative h-full flex flex-col justify-end pb-20 px-8 text-center">
          <div data-aos="fade-up">
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white drop-shadow-2xl">
              {event.title}
            </h1>
            <p className="text-2xl md:text-4xl mt-4 text-gray-200">{event.short}</p>
            <div className="mt-8 flex justify-center gap-10 text-gray-300">
              <span className="flex items-center gap-3"><Calendar size={28} /> {event.date}</span>
              <span className="flex items-center gap-3"><MapPin size={28} /> {event.location}</span>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="absolute top-8 left-8 p-3 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition"
          >
            <ChevronLeft size={32} />
          </button>
        </div>
      </div>

      {/* Full-Screen Swipe Gallery – ONE IMAGE ONLY */}
      <div className="relative bg-black min-h-screen flex flex-col">
        {/* Counter */}
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20">
          <span className="text-white font-mono text-sm tracking-wider">
            {(index + 1).toString().padStart(2, '0')} / {event.images.length.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Single Image Container */}
        <div
          className="flex-1 flex items-center justify-center px-8 py-20 select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            key={index}
            src={event.images[index]}
            alt={`Image ${index + 1}`}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            style={{
              boxShadow: '0 0 60px rgba(34, 211, 238, 0.35)',
              animation: 'fadeIn 0.5s ease-out',
            }}
          />

          {/* Subtle holographic lines */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
          </div>
        </div>

        {/* Your EXACT Styled Navigation Buttons */}
        <div className="fixed inset-x-0 bottom-10 md:bottom-16 flex justify-center z-50 pointer-events-none">
          <div className="flex gap-4 bg-black/70 backdrop-blur-2xl rounded-2xl px-6 py-4 border border-white/10 pointer-events-auto">
            {/* Left Arrow */}
            <button
              onClick={prevImage}
              className="p-5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={36} className="text-white" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={nextImage}
              className="p-5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <ChevronRight size={36} className="text-white" />
            </button>
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 text-center md:hidden">
          <p className="text-gray-500 text-xs font-mono tracking-widest animate-pulse">SWIPE TO NAVIGATE</p>
        </div>
      </div>

      {/* Fade Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}