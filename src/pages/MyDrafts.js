import React, { useEffect, useState } from 'react';
import { fetchJournals } from '../apiJournal';
import { Link, useLocation } from 'react-router-dom';
import { FileText, List, Grid3x3, Plus, Edit } from 'lucide-react';
import useAuth from '../lib/useAuth';
import './JournalList.css';

export default function MyDrafts() {
  const { user, loading: authLoading } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await fetchJournals({ mine: true, limit: 100 });
        // filter drafts
        const mine = data.journals || [];
        setDrafts(mine.filter(j => j.isDraft));
      } catch (err) {
        console.error('fetch drafts err', err);
        setError(err.message || 'Failed to load drafts');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) return (
    <div className="journal-list-page">
      <div className="empty-state">
        <FileText size={64} />
        <h3>Please sign in to view your drafts</h3>
        <Link to="/login" className="action-btn primary">Sign in</Link>
      </div>
    </div>
  );

  return (
    <div className="journal-list-page">
      <div className="journal-header-section">
        <div className="journal-title-area">
          <div className="header-title">
            <FileText size={32} />
            <h1>My Drafts</h1>
          </div>
          <p className="header-subtitle">Your unpublished journal entries</p>
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
        </div>
      </div>

      {loading ? (
        <div className="journal-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="journal-card skeleton-card">
              <div className="skeleton-title"></div>
              <div className="skeleton-meta"></div>
              <div className="skeleton-text"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {error && (
            <div style={{ maxWidth: 1400, margin: '0 auto 2rem', padding: '1rem', background: '#fee', color: '#c00', borderRadius: 12 }}>
              {error}
            </div>
          )}
          {drafts.length === 0 ? (
            <div className="empty-state">
              <FileText size={64} />
              <h3>No drafts yet</h3>
              <p>Start writing your first journal entry</p>
              <Link to="/journal/new" className="action-btn primary">
                <Plus size={18} />
                Create New Journal
              </Link>
            </div>
          ) : (
            <div className="journal-grid">
              {drafts.map(j => (
                <Link 
                  key={j._id} 
                  to={`/journal/edit/${j._id}`}
                  className="journal-card"
                >
                  <h3 className="journal-title">{j.title || '(Untitled draft)'}</h3>
                  
                  <div className="journal-meta">
                    <span className="date">
                      <Edit size={14} />
                      Draft
                    </span>
                  </div>

                  <div 
                    className="journal-excerpt"
                    dangerouslySetInnerHTML={{ 
                      __html: (j.bodyHtml || '').replace(/<[^>]*>/g, '').slice(0, 200) + 
                              ((j.bodyHtml || '').length > 200 ? '...' : '') 
                    }} 
                  />

                  <div className="read-more">
                    Continue editing →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
