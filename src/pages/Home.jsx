import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="news-section py-6 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="news-headline mb-4">Welcome to Milestone College Science Club</h1>
          <p className="news-subtext max-w-2xl mx-auto px-2 mb-8">Stay updated with the latest news, events, and achievements. Join us, make connections, and pursue your passions in a vibrant community.</p>
          <Link
            to="/club"
            className="news-button inline-block"
          >
            Explore Science Club
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <article className="news-card overflow-hidden col-span-full">
            <img 
              className="w-full h-64 object-cover" 
              src="https://via.placeholder.com/800x400?text=Science+Club+Banner" 
              alt="Science Club" 
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-headline mb-3">About Us</h2>
              <p className="text-gray-text mb-4 leading-relaxed">Founded in 2010, the Science Club has been at the forefront of promoting scientific inquiry among students. From lab experiments to national fairs, we're your hub for innovation.</p>
              <Link to="/club" className="news-link inline-block">
                Dive In →
              </Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default Home;