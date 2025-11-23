import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminLogin, adminFetchPendingJournals, adminApproveJournal, adminDeleteJournal } from '../api';
import '../index.css';

const LOCAL_TOKEN_KEY = 'mcsc_admin_token';
const LOCAL_ADMIN_KEY = 'mcsc_admin_info';

export default function AdminJournals() {
  const [adminInfo, setAdminInfo] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(LOCAL_TOKEN_KEY) || null);

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [journals, setJournals] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (token) loadJournals();
  }, [token]);

  async function loadJournals() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await adminFetchPendingJournals(token);
      if (res && res.journals) setJournals(res.journals);
      else setJournals([]);
    } catch (err) {
      console.error('Failed to load pending journals', err);
      setMessage(err.message || 'Failed to load');
      setJournals([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMessage(null);
    if (!credentials.username || !credentials.password) {
      setMessage('Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      const res = await adminLogin(credentials.username, credentials.password);
      setToken(res.token);
      setAdminInfo(res.admin);
      localStorage.setItem(LOCAL_TOKEN_KEY, res.token);
      localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(res.admin));
      setCredentials({ username: '', password: '' });
      setMessage('Logged in as ' + res.admin.username);
      await loadJournals();
    } catch (err) {
      console.error('Admin login failed', err);
      setMessage(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setToken(null);
    setAdminInfo(null);
    setJournals([]);
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    setMessage('Logged out');
  }

  async function onApprove(id) {
    setMessage(null);
    try {
      await adminApproveJournal(id, token);
      setMessage('Approved');
      await loadJournals();
    } catch (err) {
      console.error('Approve failed', err);
      setMessage(err.message || 'Approve failed');
    }
  }

  async function onDelete(id) {
    if (!confirm('Delete this journal? This action cannot be undone.')) return;
    setMessage(null);
    try {
      await adminDeleteJournal(id, token);
      setMessage('Deleted');
      await loadJournals();
    } catch (err) {
      console.error('Delete failed', err);
      setMessage(err.message || 'Delete failed');
    }
  }

  if (!token || !adminInfo) {
    return (
      <div className="card form-card" style={{ maxWidth: 520, margin: '20px auto' }}>
        <h2>Admin Login — Approve submitted journals</h2>
        <form onSubmit={handleLogin} className="form-grid" style={{ gap: 10 }}>
          <label className="full">
            Username
            <input name="username" value={credentials.username} onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))} required />
          </label>

          <label className="full">
            Password
            <input type="password" name="password" value={credentials.password} onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))} required />
          </label>

          <div className="actions full">
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          </div>
        </form>

        {message && <div className="status" style={{ marginTop: 12 }}>{message}</div>}
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 1000, margin: '20px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginTop: 0 }}>Journal Approvals — {adminInfo.username} ({adminInfo.building})</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {message && <div className="status" style={{ marginBottom: 12 }}>{message}</div>}

      {loading ? <div>Loading...</div> : (
        <div className="table-wrap">
          <table className="reg-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Created</th>
                <th>Approved</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {journals.map(j => (
                <tr key={j._id}>
                  <td><a href={`/journal/${j._id}`}>{j.title || '(untitled)'}</a></td>
                  <td>{j.authorName || j.authorEmail}</td>
                  <td>{new Date(j.createdAt).toLocaleString()}</td>
                  <td>{j.approved ? 'Yes' : 'No'}</td>
                  <td>
                    <Link to={`/admin/journals/${j._id}`} className="btn btn-ghost">View</Link>
                    {' '}
                    {!j.approved && <button className="btn btn-primary" onClick={() => onApprove(j._id)}>Approve</button>}
                    {' '}
                    <button className="btn btn-danger" onClick={() => onDelete(j._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {journals.length === 0 && <tr><td colSpan="5">No pending journals</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
