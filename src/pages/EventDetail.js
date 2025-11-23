import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './Home.css';

const ALL = {
  'past-1': {
    id: 'past-1',
    title: 'Science Fair 2024',
    date: '2024-08-12',
    description: 'A showcase of student experiments and projects. Highlights included robotics demos and chemistry shows.',
    images: ['/images/event-placeholder-1.svg', '/images/event-placeholder-2.svg', '/images/event-placeholder-3.svg', '/images/event-placeholder-4.svg'],
    detailedDescription: 'The Science Fair 2024 was a grand event featuring innovative student projects. Robotics demonstrations captivated the audience, while chemistry shows provided a visual treat. The event also included interactive sessions with experts.'
  },
  'past-2': {
    id: 'past-2',
    title: 'Astronomy Night',
    date: '2024-05-22',
    description: 'Stargazing with telescopes and a short talk on constellations and planets.',
    images: ['/images/event-placeholder-5.svg', '/images/event-placeholder-6.svg', '/images/event-placeholder-7.svg', '/images/event-placeholder-8.svg'],
    detailedDescription: 'Astronomy Night offered a mesmerizing experience with stargazing sessions using high-powered telescopes. Attendees learned about constellations and planets through engaging talks by astronomy enthusiasts.'
  },
  'future-1': {
    id: 'future-1',
    title: 'Robotics Workshop',
    date: '2025-03-10',
    description: 'Hands-on robotics workshop for beginners, building simple line-followers and obstacle-avoiders.',
    images: ['/images/event-placeholder-9.svg', '/images/event-placeholder-10.svg', '/images/event-placeholder-11.svg', '/images/event-placeholder-12.svg'],
    detailedDescription: 'The Robotics Workshop will provide hands-on training for beginners. Participants will learn to build line-following and obstacle-avoiding robots, gaining practical knowledge in robotics and programming.'
  },
  'future-2': {
    id: 'future-2',
    title: 'Chemistry Demo Day',
    date: '2025-04-05',
    description: 'A series of safe, spectacular chemistry demonstrations illustrating reaction kinetics and color changes.',
    images: ['/images/event-placeholder-13.svg', '/images/event-placeholder-14.svg', '/images/event-placeholder-15.svg', '/images/event-placeholder-16.svg'],
    detailedDescription: 'Chemistry Demo Day will feature safe and spectacular demonstrations showcasing reaction kinetics and color changes. Attendees will witness the magic of chemistry through engaging experiments.'
  }
};

export default function EventDetail() {
  const { id } = useParams();
  const event = ALL[id];

  if (!event) return <div>Event not found</div>;

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', padding: 16 }}>
      <h1>{event.title}</h1>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
      <p>{event.description}</p>

      <div style={{ marginTop: 20 }}>
        <h3>Gallery</h3>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {event.images.map((img, index) => (
            <img key={index} src={img} alt={`${event.title} image ${index + 1}`} style={{ width: '100%', borderRadius: 8 }} />
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Details</h3>
        <p>{event.detailedDescription}</p>
      </div>

      <div style={{ marginTop: 20 }}>
        <Link to="/events/past" className="btn btn-secondary">Back to Past Events</Link>
        <Link to="/events/future" className="btn btn-secondary" style={{ marginLeft: 10 }}>Back to Future Events</Link>
      </div>
    </div>
  );
}
