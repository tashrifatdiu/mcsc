import React, { useEffect, useState } from 'react';
import './RainingStickers.css';

export default function RainingStickers({ stickers, likes = 0, trigger }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const allParticles = [];

    // Add heart particles for likes
    if (likes > 0) {
      const heartCount = Math.min(likes, 10); // Max 10 hearts
      for (let i = 0; i < heartCount; i++) {
        allParticles.push({
          id: `heart-${Date.now()}-${i}`,
          emoji: '❤️',
          left: Math.random() * 100,
          delay: Math.random() * 3,
          duration: 4 + Math.random() * 3,
          size: 1 + Math.random() * 2
        });
      }
    }

    // Add sticker particles
    if (stickers && Object.keys(stickers).length > 0) {
      Object.entries(stickers).forEach(([emoji, count]) => {
        const particleCount = Math.min(count, 8); // Max 8 per sticker type
        for (let i = 0; i < particleCount; i++) {
          allParticles.push({
            id: `${emoji}-${Date.now()}-${i}`,
            emoji,
            left: Math.random() * 100,
            delay: Math.random() * 3,
            duration: 4 + Math.random() * 3,
            size: 0.8 + Math.random() * 2.2 // Varied sizes: small to big
          });
        }
      });
    }

    if (allParticles.length === 0) return;

    setParticles(allParticles);

    // Clear particles after animation
    const timer = setTimeout(() => {
      setParticles([]);
    }, 8000);

    return () => clearTimeout(timer);
  }, [trigger, stickers, likes]);

  if (particles.length === 0) return null;

  return (
    <div className="raining-stickers-container">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="sticker-particle"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            fontSize: `${particle.size}rem`
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
}
