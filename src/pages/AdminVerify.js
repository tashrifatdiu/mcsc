import React, { useEffect, useState } from 'react';
import { adminLogin, adminFetchRegistrations, adminApproveRegistration } from '../api';

const LOCAL_TOKEN_KEY = 'mcsc_admin_token';
const LOCAL_ADMIN_KEY = 'mcsc_admin_info';

const AdminVerify = () => {
  const [adminInfo, setAdminInfo] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const [token, setToken] = useState(localStorage.getItem(LOCAL_TOKEN_KEY) || null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { if (token) loadRegs(); }, [token]);

  async function loadRegs() {
    setLoading(true);
    setMessage('');
    try {
      const res = await adminFetchRegistrations(token);
      setRegs(res?.registrations || []);
    } catch (err) {
      setMessage(err.message || 'Failed to load');
      setRegs([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!credentials.username || !credentials.password) return setMessage('Fill both fields');
    setLoading(true);
    try {
      const res = await adminLogin(credentials.username, credentials.password);
      setToken(res.token);
      setAdminInfo(res.admin);
      localStorage.setItem(LOCAL_TOKEN_KEY, res.token);
      localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(res.admin));
      setCredentials({ username: '', password: '' });
      setMessage(`Welcome, ${res.admin.username}!`);
    } catch (err) {
      setMessage(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setToken(null); setAdminInfo(null); setRegs([]);
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    setMessage('Logged out');
  }

  async function onApprove(id) {
    setMessage('Approving...');
    try {
      await adminApproveRegistration(id, token);
      setMessage('Approved!');
      loadRegs();
    } catch (err) {
      setMessage(err.message || 'Failed');
    }
  }

  // LOGIN SCREEN
  if (!token || !adminInfo) {
    return (
      <>
        <style jsx>{`
          .login-page { min-height: 100vh; background: linear-gradient(135deg, #0f172a, #1e293b); color: #f1f5f9; display: grid; place-items: center; padding: 16px; font-family: system-ui, sans-serif; }
          .card { background: #1e293b; border-radius: 16px; padding: 32px 24px; width: 100%; max-width: 420px; border: 1px solid #334155; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          h2 { text-align: center; color: #fbbf24; font-size: 1.6rem; margin: 0 0 8px; }
          p { text-align: center; color: #94a3b8; font-size: 0.9rem; margin-bottom: 24px; }
          label { display: block; margin: 16px 0 6px; font-size: 0.9rem; color: #cbd5e1; }
          input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: white; font-size: 1rem; }
          input:focus { outline: none; box-shadow: 0 0 0 2px #3b82f6; }
          .btn { width: 100%; padding: 13px; margin-top: 20px; border: none; border-radius: 8px; background: #3b82f6; color: white; font-weight: 600; font-size: 1rem; cursor: pointer; }
          .btn:disabled { opacity: 0.6; cursor: not-allowed; }
          .status { margin-top: 16px; padding: 10px; border-radius: 8px; text-align: center; background: rgba(251,191,36,0.2); color: #fcd34d; font-size: 0.9rem; }
        `}</style>

        <div className="login-page">
          <div className="card">
            <h2>Admin Login</h2>
            <p>Approve registrations for your building</p>
            <form onSubmit={handleLogin}>
              <label>Username</label>
              <input value={credentials.username} onChange={e => setCredentials(p => ({...p, username: e.target.value}))}
                placeholder="Enter username" required />
              <label>Password</label>
              <input type="password" value={credentials.password} onChange={e => setCredentials(p => ({...p, password: e.target.value}))}
                placeholder="Enter password" required />
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            {message && <div className="status">{message}</div>}
          </div>
        </div>
      </>
    );
  }

  // DASHBOARD - Fully responsive with grid
  return (
    <>
      <style jsx>{`
        .page { min-height: 100vh; background: linear-gradient(135deg, #0f172a, #1e293b); color: #f1f5f9; padding: 16px; font-family: system-ui, sans-serif; font-size: 0.925rem; }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { background: #1e293b; padding: 16px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #334155; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; }
        .header h2 { margin: 0; color: #fbbf24; font-size: 1.4rem; }
        .header small { color: #94a3b8; font-size: 0.85rem; }
        .btns { display: flex; flex-wrap: wrap; gap: 8px; }
        .btn { padding: 8px 14px; border: none; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
        .btn-ghost { background: transparent; border: 1px solid #475569; color: #94a3b8; }
        .btn-danger { background: #ef4444; color: white; }
        .status { padding: 10px 14px; border-radius: 8px; background: rgba(251,191,36,0.15); color: #fcd34d; text-align: center; font-size: 0.9rem; margin-bottom: 16px; }

        /* Responsive Grid Table - No horizontal scroll */
        .grid-table {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
          padding: 8px;
        }
        .row {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          overflow: hidden;
          display: contents;
        }
        .cell {
          padding: 12px 16px;
          background: #1e293b;
          border-bottom: 1px solid #334155;
        }
        .header-cell {
          background: #0f172a;
          color: #fbbf24;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .action-cell {
          display: flex;
          justify-content: center;
          padding: 12px;
        }
        .btn-approve {
          background: #3b82f6;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        /* Mobile-first: Stack everything */
        @media (min-width: 640px) {
          .grid-table { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .grid-table { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1280px) {
          .grid-table { grid-template-columns: repeat(4, 1fr); }
        }

        .empty { grid-column: 1 / -1; text-align: center; padding: 40px; color: #94a3b8; font-size: 1rem; }
        .loading { text-align: center; padding: 60px; color: #fbbf24; font-size: 1.1rem; }
      `}</style>

      <div className="page">
        <div className="container">
          <div className="header">
            <div>
              <h2>Admin Panel — {adminInfo.username}</h2>
              <small>Building: {adminInfo.building}</small>
            </div>
            <div className="btns">
              <button className="btn btn-ghost" onClick={() => window.location.href = '/admin/journals'}>Journals</button>
              <button className="btn btn-ghost" onClick={() => window.location.href = '/admin/courses'}>Courses</button>
              <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </div>
          </div>

          {message && <div className="status">{message}</div>}

          {loading ? (
            <div className="loading">Loading registrations...</div>
          ) : regs.length === 0 ? (
            <div className="empty">No registrations found for your building</div>
          ) : (
            <div className="grid-table">
              {/* Header Row */}
              <div className="cell header-cell">Name</div>
              <div className="cell header-cell">Code</div>
              <div className="cell header-cell">Class / Dept</div>
              <div className="cell header-cell">Contact / Building</div>

              {regs.map(r => (
                <React.Fragment key={r._id}>
                  {/* Data Cells */}
                  <div className="cell"><strong>{r.name}</strong></div>
                  <div className="cell"><strong>{r.code}</strong></div>
                  <div className="cell">
                    {r['class']} • {r.department}<br />
                    <small style={{color: '#94a3b8'}}>{r.section} | {r.campus}</small>
                  </div>
                  <div className="cell">
                    {r.contactNumber}<br />
                    <small style={{color: '#94a3b8'}}>Building: {r.building}</small>
                  </div>

                  {/* Status + Action - Full width on mobile */}
                  <div className="cell" style={{gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px'}}>
                    <span style={{color: r.approved ? '#86efac' : '#fbbf24', fontWeight: 600}}>
                      {r.approved ? 'Approved' : 'Pending Approval'}
                    </span>
                    {!r.approved && (
                      <button className="btn-approve" onClick={() => onApprove(r._id)}>
                        Approve
                      </button>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminVerify;