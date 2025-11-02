// Updated src/components/History.js (minor: better prose for longer text)
import React from 'react';

const History = ({ history }) => {
  return (
    <article className="news-card p-8 max-w-4xl mx-auto bg-gradient-to-r from-gray-50 to-gray-100">
      <h2 className="news-headline mb-6 text-center">Our Journey</h2>
      <div className="prose prose-slate max-w-none text-lg leading-relaxed">
        <p>{history}</p>
      </div>
      <div className="mt-8 text-center">
        <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm">Since 2010</span>
      </div>
    </article>
  );
};

export default History;