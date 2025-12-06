import React, { useEffect, useState } from 'react';
import { fetchJournals } from '../apiJournal';
import { Link, useParams } from 'react-router-dom';
import { User, Calendar, BookOpen, ArrowLeft } from 'lucide-react';
import './JournalList.css';

export default function AuthorWorks() {
  const { authorId } = useParams();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState('');

  useEffect(() => {
    loadAuthorJournals();
  }, [authorId]);

  const loadAuthorJournals = async () => {
    try {
      setLoading(true);
      const data = await fetchJournals({ authorId, limit: 50 });
      setJournals(data.journals || []);
      if (data.journals && data.journals.length > 0) {
        setAuthorName(data.journals[0].authorName || data.journals[0].authorEmail || 'Unknown Author');
      }
    } catch (err) {
      console.error('fetch author journals err', err);
      setJournals([]);
    } finally {
      setLoading(false);
    }
  };

  const getExcerpt = (html, maxLength = 150) => {
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className="journal-list-page">
      <div className="journal-header-section">
        <Link to="/journal" className="back-link" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
          <ArrowLeft size={18} />
          Back to Journals
        </Link>
        <div className="journal-title-area">
          <div className="header-title">
            <User size={32} />
            <h1>{authorName}'s Works</h1>
          </div>
          <p className="header-subtitle">
            {journals.length} {journals.length === 1 ? 'journal' : 'journals'} published
          </p>
        </div>
      </div>

      {loading ? (
        <div className="journal-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="journal-card skeleton-card">
              <div className="skeleton-title"></div>
              <div className="skeleton-meta"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
          ))}
        </div>
      ) : journals.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={64} />
          <h3>No published journals yet</h3>
          <p>This author hasn't published any journals</p>
        </div>
      ) : (
        <div className="journal-grid">
          {journals.map(j => (
            <Link 
              key={j._id} 
              to={`/journal/${j._id}`}
              className="journal-card"
            >
              <h3 className="journal-title">{j.title}</h3>
              
              <div className="journal-meta">
                <span className="date">
                  <Calendar size={14} />
                  {new Date(j.publishedAt || j.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <p className="journal-excerpt">
                {getExcerpt(j.bodyHtml || '')}
              </p>

              <div className="read-more">
                Read more →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
