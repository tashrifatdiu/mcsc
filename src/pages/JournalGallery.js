import React, { useEffect, useState } from 'react';
import { fetchJournals } from '../apiJournal';
import { Link, useLocation } from 'react-router-dom';
import { Grid3x3, User, Calendar, BookOpen, List, Plus, FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import useAuth from '../lib/useAuth';
import JournalContributors from '../components/JournalContributors';
import './JournalList.css';

export default function JournalGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const { user } = useAuth();
  const location = useLocation();
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    loadJournals();
  }, [page, timeFilter, search]);

  const loadJournals = async () => {
    try {
      setLoading(true);
      const data = await fetchJournals({ 
        limit: ITEMS_PER_PAGE, 
        skip: page * ITEMS_PER_PAGE,
        sortBy: 'engagement',
        search,
        timeFilter
      });
      setItems((data && data.journals) ? data.journals : []);
      setHasMore(data.hasMore || false);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('gallery fetch err', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const getExcerpt = (html, maxLength = 120) => {
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className="journal-list-page">
      <div className="journal-header-section">
        <div className="journal-title-area">
          <div className="header-title">
            <Grid3x3 size={32} />
            <h1>Journal Gallery</h1>
          </div>
          <p className="header-subtitle">Most engaged journals from our community</p>
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

      <div className="journal-filters-section">
        <form onSubmit={handleSearch} className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search journals by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

        <div className="time-filters">
          <button
            className={`filter-btn ${timeFilter === '' ? 'active' : ''}`}
            onClick={() => { setTimeFilter(''); setPage(0); }}
          >
            All Time
          </button>
          <button
            className={`filter-btn ${timeFilter === '24h' ? 'active' : ''}`}
            onClick={() => { setTimeFilter('24h'); setPage(0); }}
          >
            Last 24 Hours
          </button>
          <button
            className={`filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
            onClick={() => { setTimeFilter('week'); setPage(0); }}
          >
            Last Week
          </button>
          <button
            className={`filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
            onClick={() => { setTimeFilter('month'); setPage(0); }}
          >
            Last Month
          </button>
        </div>

        {total > 0 && (
          <div className="results-info">
            Showing {page * ITEMS_PER_PAGE + 1}-{Math.min((page + 1) * ITEMS_PER_PAGE, total)} of {total} journals
          </div>
        )}
      </div>

      {loading ? (
        <div className="journal-grid gallery-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="journal-card skeleton-card">
              <div className="skeleton-title"></div>
              <div className="skeleton-meta"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <Grid3x3 size={64} />
          <h3>No journals found</h3>
          <p>{search ? 'Try a different search term' : 'Check back soon for new entries'}</p>
        </div>
      ) : (
        <>
          <div className="journal-grid gallery-grid">
            {items.map(j => (
              <Link 
                key={j._id} 
                to={`/journal/${j._id}`}
                className="journal-card"
              >
                <h3 className="journal-title">{j.title}</h3>
                
                <div className="journal-meta">
                  <Link 
                    to={`/journal/author/${j.authorSupabaseId}`}
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

          {(page > 0 || hasMore) && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft size={20} />
                Previous
              </button>
              <span className="page-info">Page {page + 1}</span>
              <button
                className="pagination-btn"
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}

      <JournalContributors />
    </div>
  );
}
