// src/pages/PastEvents.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Zap } from 'lucide-react';
import EVENTS from '../data/events';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function PastEvents() {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-32 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-20" data-aos="fade-up">
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient">
            PAST EVENTS
          </h1>
          <p className="text-2xl mt-6 text-gray-400 font-light tracking-wide">
            Where legends were made
          </p>
          <div className="mt-4 flex justify-center">
            <Zap className="w-12 h-12 text-cyan-400 animate-bounce" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {EVENTS.map((event, i) => (
            <div
              key={event.id}
              data-aos="fade-up"
              data-aos-delay={i * 150}
              className="group relative"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              {/* 3D Tilt Card */}
              <div className="relative preserve-3d group-hover:rotate-y-12 group-hover:rotate-x-6 transition-all duration-700">
                <div className={`absolute inset-0 bg-gradient-to-br ${event.color} opacity-60 blur-3xl group-hover:opacity-90 transition-opacity duration-700`}></div>
                
                <div className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-2xl group-hover:shadow-${event.glow} transition-all duration-700">
                  <div className="relative h-96 overflow-hidden">
                    <img
                      src={`/images/${event.cover}`}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
                    
                    <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-xl px-5 py-3 rounded-full border border-white/30">
                      <span className="text-white font-bold text-sm tracking-wider">{event.images.length} PHOTOS</span>
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className={`text-4xl font-black mb-3 bg-gradient-to-r ${event.color} bg-clip-text text-transparent`}>
                      {event.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">{event.short}</p>
                    <p className="text-gray-300 leading-relaxed mb-6">{event.desc}</p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-400">
                        <span className="flex items-center gap-2"><Calendar size={16} /> {event.date.split(' ')[0]} {event.date.split(' ')[1]}</span>
                        <span className="flex items-center gap-2"><MapPin size={16} /> {event.location}</span>
                      </div>
                      <ArrowRight className="w-8 h-8 text-cyan-400 group-hover:translate-x-4 transition-all" />
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