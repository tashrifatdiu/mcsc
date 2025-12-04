import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './JournalSection.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function JournalSection() {
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestJournals();
  }, []);

  const fetchLatestJournals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/journal?status=published&limit=3`);
      const data = await response.json();
      
      if (response.ok) {
        setJournals(data.journals || []);
      }
    } catch (err) {
      console.error('Error fetching journals:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="home-section journal-section" aria-labelledby="journal-heading">
      <div className="section-title">
        <div className="kicker">Journal</div>
        <h2 id="journal-heading">Club Journal</h2>
      </div>

      <p className="journal-intro">
        Our in-house journal features articles, experiments, and student research from our talented members.
      </p>

      {loading && (
        <div className="journal-loading">
          <div className="loading-spinner"></div>
          <p>Loading journals...</p>
        </div>
      )}

      {!loading && journals.length === 0 && (
        <div className="journal-empty">
          <p>No published journals yet. Check back soon!</p>
        </div>
      )}

      {!loading && journals.length > 0 && (
        <div className="journal-grid">
          {journals.map((journal) => (
            <div 
              key={journal._id} 
              className="journal-card"
              onClick={() => navigate(`/journal/${journal._id}`)}
            >
              <div className="journal-header">
                <h3>{journal.title}</h3>
                <span className="journal-date">{formatDate(journal.createdAt)}</span>
              </div>
              <p className="journal-excerpt">
                {journal.content?.substring(0, 150)}...
              </p>
              <div className="journal-footer">
                <span className="journal-author">By {journal.authorName || 'Anonymous'}</span>
                <span className="journal-read-more">Read More →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="journal-actions">
        <Link to="/journal" className="journal-btn journal-btn-primary">
          View All Journals
        </Link>
        <Link to="/journal/gallery" className="journal-btn journal-btn-secondary">
          Gallery View
        </Link>
      </div>
    </div>
  );
}
