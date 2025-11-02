// Updated src/components/Members.js (responsive grid: 1 col mobile, 3 col desktop; added hover effects with glassmorphism)
import React from 'react';

const Members = ({ members }) => {
  return (
    <div className="grid gap-4 sm:gap-6 max-w-4xl mx-auto px-2">
      <h2 className="news-headline col-span-full mb-4 sm:mb-6 text-center sm:text-left">Our Team</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {members.map((member, index) => (
          <div 
            key={index} 
            className="news-card p-4 sm:p-6 text-center transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-white/10 hover:backdrop-blur-sm hover:border hover:border-white/20 hover:shadow-xl"
          >
            <img 
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-full mx-auto mb-3 sm:mb-4 shadow-md transition-transform duration-300 hover:scale-110" 
              src={member.image} 
              alt={member.name} 
            />
            <h3 className="text-base sm:text-lg font-bold text-gray-headline transition-colors duration-300 hover:text-white">{member.name}</h3>
            <p className="text-gray-text text-xs sm:text-sm transition-colors duration-300 hover:text-gray-200">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Members;