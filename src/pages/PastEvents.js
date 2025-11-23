import React from 'react';
import './Home.css';

const EVENTS = [
  {
    id: 'past-1',
    title: 'Science Fair 2024',
    date: '2024-08-12',
    description: 'A showcase of student experiments and projects. Highlights included robotics demos and chemistry shows.',
    image: '/images/event-placeholder-1.svg'
  },
  {
    id: 'past-2',
    title: 'Astronomy Night',
    date: '2024-05-22',
    description: 'Stargazing with telescopes and a short talk on constellations and planets.',
    image: '/images/event-placeholder-2.svg'
  }
];

export default function PastEvents() {
  return (
    <div className="home-section" style={{ maxWidth: 1100, margin: '20px auto' }}>
      <div className="section-title">
        <div className="kicker">Events</div>
        <h2>Past Events</h2>
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
