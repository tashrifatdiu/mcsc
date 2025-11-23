import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminFetchJournalById, adminApproveJournal, adminDeleteJournal } from '../api';

const LOCAL_TOKEN_KEY = 'mcsc_admin_token';

export default function AdminJournalView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [token] = useState(() => localStorage.getItem(LOCAL_TOKEN_KEY) || null);
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMessage(null);
      try {
        const res = await adminFetchJournalById(id, token);
        setJournal(res.journal);
      } catch (err) {
        console.error('Admin fetch journal err', err);
        setMessage(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  async function handleApprove() {
    setMessage(null);
    try {
      await adminApproveJournal(id, token);
      setMessage('Approved');
      // reload
      const res = await adminFetchJournalById(id, token);
      setJournal(res.journal);
    } catch (err) {
      console.error('Approve failed', err);
      setMessage(err.message || 'Approve failed');
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this journal? This action cannot be undone.')) return;
    setMessage(null);
    try {
      await adminDeleteJournal(id, token);
      setMessage('Deleted');
      navigate('/admin/journals');
    } catch (err) {
      console.error('Delete failed', err);
      setMessage(err.message || 'Delete failed');
    }
  }

  if (loading) return <div style={{ maxWidth: 900, margin: '20px auto' }}>Loading...</div>;
  if (message && !journal) return <div style={{ maxWidth: 900, margin: '20px auto' }}>{message}</div>;

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', padding: 16 }} className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>{journal?.title || '(untitled)'}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {!journal?.approved && <button className="btn btn-primary" onClick={handleApprove}>Approve</button>}
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          <Link to="/admin/journals" className="btn btn-ghost">Back</Link>
        </div>
      </div>

      <div style={{ marginTop: 8, color: '#6b7280' }}>{journal?.authorName || journal?.authorEmail} • {new Date(journal?.createdAt).toLocaleString()}</div>
      <div style={{ marginTop: 12, fontFamily: journal?.fontFamily }} dangerouslySetInnerHTML={{ __html: journal?.bodyHtml || '' }} />
    </div>
  );
}
