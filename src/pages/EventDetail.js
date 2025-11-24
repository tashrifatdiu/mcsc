// src/pages/EventDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, X, ChevronLeft as Prev, ChevronRight as Next, Sparkles, Calendar, MapPin } from 'lucide-react';
import EVENTS from '../data/events';
import AOS from 'aos';

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const event = EVENTS.find(e => e.id === eventId);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => { AOS.init({ duration: 1200 }); }, []);

  if (!event) return <div className="min-h-screen bg-black flex-center text-6xl text-white">404</div>;

  return (
    <>
      {/* Hero */}
      <div className="relative h-screen overflow-hidden">
        <img src={`/images/${event.cover}`} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/70"></div>
        <div className={`absolute inset-0 bg-gradient-to-br ${event.color} opacity-40`}></div>

        <div className="relative h-full flex items-center justify-center text-center px-6">
          <div data-aos="fade-up">
            <h1 className="text-8xl md:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white animate-pulse">
              {event.title}
            </h1>
            <p className="text-3xl mt-6 text-gray-300 font-light">{event.short}</p>
            <div className="mt-10 flex justify-center gap-10 text-xl">
              <span className="flex items-center gap-3"><Calendar /> {event.date}</span>
              <span className="flex items-center gap-3"><MapPin /> {event.location}</span>
            </div>
            <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mt-10 animate-spin-slow" />
          </div>

          <button onClick={() => navigate(-1)} className="absolute top-10 left-10 p-4 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition">
            <ChevronLeft size={32} />
          </button>
        </div>
      </div>

      {/* Content + Gallery */}
      <div className="relative -mt-32 z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="grid lg:grid-cols-3 gap-12 mb-20">
          <div className="lg:col-span-2" data-aos="fade-right">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 shadow-2xl">
              <h2 className="text-5xl font-black mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Event Story</h2>
              <p className="text-xl leading-relaxed text-gray-300">{event.desc}</p>
            </div>
          </div>

          <div data-aos="fade-left" className={`bg-gradient-to-br ${event.color} bg-opacity-20 backdrop-blur-2xl rounded-3xl p-10 border border-white/30 shadow-2xl`}>
            <h3 className="text-4xl font-black mb-6">Gallery</h3>
            <p className="text-8xl font-black">{event.images.length}</p>
            <p className="text-2xl text-gray-300">Moments</p>
          </div>
        </div>

        <h2 data-aos="fade-up" className="text-7xl font-black text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
          GALLERY
        </h2>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-6">
          {event.images.map((img, i) => (
            <div
              key={i}
              onClick={() => { setIndex(i); setOpen(true); }}
              className="mb-6 break-inside-avoid group cursor-zoom-in overflow-hidden rounded-2xl shadow-2xl hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-500"
              data-aos="fade-up"
              data-aos-delay={i * 50}
            >
              <img src={`/images/${img}`} className="w-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {open && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setOpen(false)}>
          <button className="absolute top-8 right-8 p-4 bg-white/10 rounded-full hover:bg-white/20"><X size={40} /></button>
          <button onClick={(e) => { e.stopPropagation(); setIndex((i) => (i - 1 + event.images.length) % event.images.length); }} className="absolute left-10 p-6 bg-white/10 rounded-full hover:bg-white/20"><Prev size={50} /></button>
          <button onClick={(e) => { e.stopPropagation(); setIndex((i) => (i + 1) % event.images.length); }} className="absolute right-10 p-6 bg-white/10 rounded-full hover:bg-white/20"><Next size={50} /></button>
          <img src={`/images/${event.images[index]}`} className="max-w-full max-h-full object-contain" />
          <p className="absolute bottom-10 text-2xl font-bold text-white/80">{index + 1} / {event.images.length}</p>
        </div>
      )}
    </>
  );
}