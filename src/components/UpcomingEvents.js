import React from 'react';
import './UpcomingEvents.css'; // Import the external CSS file

const EVENTS = [
  { title: 'Science Fair 2025', date: '2025-02-20', location: 'Main Hall', desc: 'Project showcase and awards.' },
  { title: 'Robotics Workshop', date: '2025-03-11', location: 'Lab 3', desc: 'Intro to Arduino and sensors.' },
  { title: 'Journal Club Meet', date: '2025-04-05', location: 'Room 12', desc: 'Discussing latest student articles.' }
];

export default function UpcomingEvents() {
  return (
    <div className="home-section" aria-labelledby="events-heading">
      <div className="section-title">
        <div className="kicker">Events</div>
        <h2 id="events-heading">Upcoming events</h2>
      </div>

      <div className="events-grid">
        {EVENTS.map((e, i) => (
          <div key={i} className="event">
            <div className="event-header">
              <div>
                <h3>{e.title}</h3>
                <div className="small-muted">{e.location}</div>
              </div>
              <div className="event-date">
                <div>{e.date}</div>
                <div className="small-muted">Date</div>
              </div>
            </div>
            <p className="small-muted event-desc">{e.desc}</p>
            <div className="event-actions">
              <button>Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}