// New src/components/NewsDetail.js (full reading page: immersive layout, back button, full content)
import React from 'react';
import { useParams, Link } from 'react-router-dom';

const NewsDetail = ({ clubData }) => { // Receive clubData to find news
  const { id, newsId } = useParams(); // club id and news id
  const club = clubData[id] || clubData.science;
  const newsItem = club.news.find(n => n.id === parseInt(newsId));

  if (!newsItem) {
    return <div className="text-center py-8">News not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-primary">
      <header className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to={`/club/${id}/news`} className="news-link mb-4 inline-block">&larr; Back to News</Link>
        </div>
      </header>
      <article className="max-w-3xl mx-auto px-4 py-8">
        {/* Byline and date */}
        <div className="flex justify-between items-center mb-6 text-sm text-gray-deep">
          <span className="italic">{newsItem.bylines}</span>
          <span>{newsItem.date}</span>
        </div>
        {/* Full headline */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-headline mb-6 leading-tight font-serif">{newsItem.title}</h1>
        {/* Full content, no clamp */}
        <div className="prose prose-slate max-w-none leading-relaxed text-base">
          <p className="first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:pt-2 first-letter:leading-none">
            {newsItem.content}
          </p>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-accent text-sm text-gray-deep">
          <p>Share this story | Comments: 0</p>
        </div>
      </article>
    </div>
  );
};

export default NewsDetail;