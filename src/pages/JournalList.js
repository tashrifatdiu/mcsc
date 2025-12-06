// client/src/pages/JournalList.js
import React, { useEffect, useState } from 'react';
import { fetchJournals } from '../apiJournal';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Plus, FileText, Grid3x3, User, Calendar, List } from 'lucide-react';
import useAuth from '../lib/useAuth';
import JournalContributors from '../components/JournalContributors';
import './JournalList.css';

export default function JournalList() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchJournals({ limit: 50 });
        setJournals(data.journals || []);
      } catch (err) {
        console.error('fetch journals err', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Extract text from HTML
  const getExcerpt = (html, maxLength = 150) => {
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className="journal-list-page">
      <div className="journal-header-section">
        <div className="journal-title-area">
          <div className="header-title">
            <BookOpen size={32} />
            <h1>Journal Entries</h1>
          </div>
          <p className="header-subtitle">Explore thoughts, ideas, and stories from our community</p>
        </div>
      </div>

      <div className="journal-nav-section">
        <div className="journal-nav">
          <Link 
            to="/journal" 
            className={`journal-nav-link ${location.pathname === '/journal' ? 'active' : ''}`}
          >
            <List size={18} />
            All Journals
          </Link>
          <Link 
            to="/journal/gallery" 
            className={`journal-nav-link ${location.pathname === '/journal/gallery' ? 'active' : ''}`}
          >
            <Grid3x3 size={18} />
            Gallery View
          </Link>
          {user && (
            <>
              <Link 
                to="/journal/new" 
                className={`journal-nav-link ${location.pathname === '/journal/new' ? 'active' : ''}`}
              >
                <Plus size={18} />
                New Journal
              </Link>
              <Link 
                to="/journal/drafts" 
                className={`journal-nav-link ${location.pathname === '/journal/drafts' ? 'active' : ''}`}
              >
                <FileText size={18} />
                My Drafts
              </Link>
            </>
          )}
          {!user && (
            <Link to="/login" className="journal-nav-link">
              Login to create
            </Link>
          )}
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
          <h3>No journal entries yet</h3>
          <p>Be the first to share your thoughts and ideas</p>
          {user && (
            <Link to="/journal/new" className="action-btn primary">
              <Plus size={18} />
              Create First Journal
            </Link>
          )}
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
                <Link 
                  to={`/journal/author/${j.authorSupabaseId || j.authorId || j.author}`}
                  className="author-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  <User size={14} />
                  {j.authorName || j.authorEmail}
                </Link>
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

      <JournalContributors />
    </div>
  );
}