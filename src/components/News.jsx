// Updated src/components/News.js (make items clickable Links to detail, pass clubId)
import React from 'react';
import { Link } from 'react-router-dom';

const News = ({ news, clubId }) => { // Add clubId prop
  return (
    <div className="max-w-4xl mx-auto px-2 space-y-8">
      <header className="border-b-2 border-gray-border pb-4">
        <h2 className="news-headline text-center">Latest News</h2>
        <p className="text-sm text-gray-deep text-center italic mt-2">Updates from the Milestone College Clubs</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {news.map((item) => (
          <article key={item.id} className="news-card p-6 bg-white cursor-pointer hover:shadow-news-lg transition-shadow"> {/* Hover for interactivity */}
            <Link to={`/club/${clubId}/news/${item.id}`} className="block"> {/* Link to detail */}
              <div className="flex justify-between items-center mb-4 text-xs text-gray-deep">
                <span className="italic">{item.bylines}</span>
                <span>{item.date}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-headline mb-3 leading-tight font-serif hover:text-blue-600 transition-colors">{item.title}</h3> {/* Hover color */}
              <div className="prose prose-slate max-w-none text-sm leading-relaxed">
                <p className="first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:pt-1 first-letter:leading-none line-clamp-3"> {/* Truncate for teaser */}
                  {item.content}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-accent">
                <span className="text-xs text-gray-deep">Read full story →</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};

export default News;