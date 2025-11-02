// Updated src/components/PastEvents.js (enhanced: images, colorful cards, detailed layouts)
import React from 'react';

const PastEvents = ({ events }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto px-2">
      <h2 className="news-headline mb-6 text-center">Past Events Gallery</h2>
      <div className="space-y-6">
        {events.map((event) => (
          <article key={event.id} className={`news-card overflow-hidden rounded-2xl ${event.color} border-l-4 border-opacity-50 shadow-lg`}>
            <div className="md:flex">
              <img 
                className="w-full md:w-1/3 h-48 md:h-auto object-cover" 
                src={event.image} 
                alt={event.title} 
              />
              <div className="p-6 flex-1">
                <h3 className="text-2xl font-bold text-gray-headline mb-3">{event.title}</h3>
                <p className="text-sm text-gray-500 mb-4 italic">{event.date}</p>
                <p className="news-subtext mb-4 leading-relaxed">{event.description}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-deep">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">📸 Gallery</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">🎉 400+ Attendees</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default PastEvents;