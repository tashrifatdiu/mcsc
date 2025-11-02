import React, { useState, useEffect } from 'react';

const FutureEvents = ({ events, onRegister, resetTrigger }) => {
  const [selectedSubs, setSelectedSubs] = useState({});

  useEffect(() => {
    setSelectedSubs({});
  }, [resetTrigger]);

  const handleCheckboxChange = (eventId, subId) => {
    setSelectedSubs(prev => {
      const current = prev[eventId] || [];
      const newSelected = current.includes(subId)
        ? current.filter(id => id !== subId)
        : [...current, subId];
      return { ...prev, [eventId]: newSelected };
    });
  };

  const handleRegister = (event) => {
    const selected = selectedSubs[event.id] || [];
    if (selected.length === 0) {
      alert('Select at least one activity.');
      return;
    }
    onRegister({ ...event, selectedSubs: selected });
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-2">
      <h2 className="news-headline mb-4 sm:mb-6">Upcoming Events</h2>
      {events.map((event) => (
        <article key={event.id} className="news-card p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-headline mb-2">{event.title}</h3>
          <p className="text-sm text-gray-500 mb-2 sm:mb-3">{event.date}</p>
          <p className="news-subtext mb-3 sm:mb-4 text-sm sm:text-base">{event.description}</p>
          {event.subEvents && (
            <div className="space-y-2 sm:space-y-3 mb-4 bg-gray-accent p-3 sm:p-4 rounded-lg">
              {event.subEvents.map((sub) => (
                <label key={sub.id} className="flex items-center cursor-pointer text-sm sm:text-base">
                  <input
                    type="checkbox"
                    checked={selectedSubs[event.id]?.includes(sub.id) || false}
                    onChange={() => handleCheckboxChange(event.id, sub.id)}
                    className="mr-2 sm:mr-3 h-4 w-4 text-blue-600"
                  />
                  <span className="text-gray-text">{sub.name} (200 TK)</span>
                </label>
              ))}
              <p className="text-sm font-semibold text-gray-headline">
                Total: {(selectedSubs[event.id]?.length || 0) * 200} TK
              </p>
            </div>
          )}
          <button
            onClick={() => handleRegister(event)}
            disabled={(selectedSubs[event.id]?.length || 0) === 0}
            className="w-full sm:w-auto news-button disabled:bg-gray-accent disabled:text-gray-text disabled:shadow-none"
          >
            Register Now
          </button>
        </article>
      ))}
    </div>
  );
};

export default FutureEvents;