import React, { useEffect, useState } from 'react';
import { fetchJournals } from '../apiJournal';
import { Link } from 'react-router-dom';
import useAuth from '../lib/useAuth';

export default function MyDrafts() {
  const { user, loading: authLoading } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 20, textAlign: 'center' }}>
      <h3>Please sign in to view your drafts</h3>
      <Link to="/login" className="btn btn-primary">Sign in</Link>
    </div>
  );

  return (
    <div style={{ maxWidth: 980, margin: '20px auto' }}>
      <h2>Your Drafts</h2>
      {loading ? <div>Loading...</div> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {error && <div style={{ color: 'crimson' }}>{error}</div>}
          {drafts.map(j => (
            <div key={j._id} style={{ padding:12, borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', background:'#333', color:'#fff' }}>
              <Link to={`/journal/edit/${j._id}`} style={{ fontSize:18, fontWeight:700, color:'#90caf9' }}>{j.title || '(Untitled draft)'}</Link>
              <div style={{ color:'#ccc', marginTop:6 }}>{j.authorName || j.authorEmail} 
                
              </div>
              <div style={{ marginTop:8, color:'#ddd' }} dangerouslySetInnerHTML={{ __html: (j.bodyHtml || '').slice(0, 300) + (j.bodyHtml && j.bodyHtml.length > 300 ? '...' : '') }} />
            </div>
          ))}
          {drafts.length === 0 && <div>No drafts yet.</div>}
        </div>
      )}
    </div>
  );
}
