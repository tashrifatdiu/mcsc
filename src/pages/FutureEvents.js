import React from 'react';
import './Home.css';

const EVENTS = [
  {
    id: 'future-1',
    title: 'Robotics Workshop',
    date: '2025-03-10',
    description: 'Hands-on robotics workshop for beginners, building simple line-followers and obstacle-avoiders.',
    image: '/images/event-placeholder-1.svg'
  },
  {
    id: 'future-2',
    title: 'Chemistry Demo Day',
    date: '2025-04-05',
    description: 'A series of safe, spectacular chemistry demonstrations illustrating reaction kinetics and color changes.',
    image: '/images/event-placeholder-2.svg'
  }
];

export default function FutureEvents() {
  return (
    <div className="home-section" style={{ maxWidth: 1100, margin: '20px auto' }}>
      <div className="section-title">
        <div className="kicker">Events</div>
        <h2>Upcoming Events</h2>
      </div>

      <div className="events-grid">
        {EVENTS.map(ev => (
          <article key={ev.id} className="event" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderRadius: 10, overflow: 'hidden' }}>
              <a href={`/events/${ev.id}`} style={{ display: 'block' }}>
                <img src={ev.image} alt={ev.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              </a>
            </div>
            <div style={{ paddingTop: 10 }}>
              <h3 style={{ margin: 0 }}><a href={`/events/${ev.id}`} style={{ color:'inherit', textDecoration:'none' }}>{ev.title}</a></h3>
              <p className="small-muted" style={{ marginTop: 6 }}>{new Date(ev.date).toLocaleDateString()}</p>
              <p style={{ marginTop: 8 }}>{ev.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
