import React from 'react';

const NotAuthorized = () => {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 720, textAlign: 'center', background: '#111827', borderRadius: 12, padding: 28, border: '1px solid #374151' }}>
        <h1 style={{ color: '#fbbf24', marginBottom: 8 }}>Not Authorized</h1>
        <p style={{ color: '#cbd5e1', marginBottom: 16 }}>You do not have permission to view this page. If you think this is a mistake, please contact an administrator or ensure you are logged in with a club member account.</p>
        <div>
          <a href="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Go back home</a>
        </div>
      </div>
    </div>
  );
};

export default NotAuthorized;
