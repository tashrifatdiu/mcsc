import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../api';
import { Building, Eye, EyeOff } from 'lucide-react';
import './AdminLoginPage.css';

const LOCAL_TOKEN_KEY = 'mcsc_admin_token';
const LOCAL_ADMIN_KEY = 'mcsc_admin_info';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      setMessage('Please fill in both fields');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const res = await adminLogin(credentials.username, credentials.password);
      
      // Save to localStorage
      localStorage.setItem(LOCAL_TOKEN_KEY, res.token);
      localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(res.admin));
      
      // Redirect to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setMessage(err.message || 'Login failed');
      setCredentials({ ...credentials, password: '' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <Building size={48} />
          </div>
          <h2>Admin Login</h2>
          <p>Enter your credentials to access the admin panel</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text"
              value={credentials.username} 
              onChange={e => setCredentials({ ...credentials, username: e.target.value })}
              placeholder="Enter username" 
              required 
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={credentials.password} 
                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Enter password" 
                required 
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {message && (
            <div className="login-message error">
              {message}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
