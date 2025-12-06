import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import './AdminLogin.css';

const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123'; // Change this!

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (isAuthenticated === 'true') {
      navigate('/admin/jacket-orders');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate a small delay for security
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        navigate('/admin/jacket-orders');
      } else {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <div className="admin-icon">
            <Shield size={48} />
          </div>
          <h1>Admin Access</h1>
          <p>Enter password to access admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="password-input-group">
            <Lock size={20} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              required
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading || !password}
          >
            {loading ? 'Verifying...' : 'Access Admin Panel'}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Authorized personnel only</p>
        </div>
      </div>
    </div>
  );
}
