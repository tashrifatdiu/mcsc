// Updated src/components/Achievements.js (now handles objects with title/description for richer content)
import React from 'react';

const Achievements = ({ achievements }) => {
  return (
    <div className="grid gap-6 max-w-4xl mx-auto">
      <h2 className="news-headline col-span-full mb-6 text-center">Highlights & Achievements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((achievement, index) => (
          <div key={index} className="news-card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500"> {/* Colorful gradient */}
            <h3 className="text-lg font-bold text-gray-headline mb-2">{achievement.title}</h3>
            <p className="news-subtext text-sm">{achievement.description}</p>
            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">🏆 Award</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;