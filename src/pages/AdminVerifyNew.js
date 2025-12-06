import React, { useEffect, useState } from 'react';
import { adminLogin, adminFetchRegistrations, adminApproveRegistration } from '../api';
import { Search, Filter, ChevronLeft, ChevronRight, CheckCircle, User, Mail, Phone, Building, BookOpen, LogOut } from 'lucide-react';
import './AdminVerifyNew.css';

const LOCAL_TOKEN_KEY = 'mcsc_admin_token';
const LOCAL_ADMIN_KEY = 'mcsc_admin_info';

const ITEMS_PER_PAGE = 10;

export default function AdminVerifyNew() {
  const [adminInfo, setAdminInfo] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const [token, setToken] = useState(localStorage.getItem(LOCAL_TOKEN_KEY) || null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [allRegs, setAllRegs] = useState([]);
  const [filteredRegs, setFilteredRegs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    version: '',
    department: '',
    building: ''
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { if (token) loadRegs(); }, [token]);

  useEffect(() => {
    // Apply search and filters
    let filtered = [...allRegs];

    // Search by name, phone, or ID
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reg => 
        reg.name?.toLowerCase().includes(query) ||
        reg.contactNumber?.includes(query) ||
        reg._id?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.class) {
      filtered = filtered.filter(reg => reg.class === parseInt(filters.class));
    }
    if (filters.section) {
      filtered = filtered.filter(reg => reg.section?.toLowerCase() === filters.section.toLowerCase());
    }
    if (filters.version) {
      filtered = filtered.filter(reg => reg.version?.toLowerCase() === filters.version.toLowerCase());
    }
    if (filters.department) {
      filtered = filtered.filter(reg => reg.department?.toLowerCase() === filters.department.toLowerCase());
    }
    if (filters.building) {
      filtered = filtered.filter(reg => reg.building?.toLowerCase() === filters.building.toLowerCase());
    }

    setFilteredRegs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, filters, allRegs]);

  async function loadRegs() {
    setLoading(true);
    setMessage('');
    try {
      const res = await adminFetchRegistrations(token);
      setAllRegs(res?.registrations || []);
      setFilteredRegs(res?.registrations || []);
    } catch (err) {
      setMessage(err.message || 'Failed to load');
      setAllRegs([]);
      setFilteredRegs([]);
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
    setToken(null); setAdminInfo(null); setAllRegs([]); setFilteredRegs([]);
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

  const clearFilters = () => {
    setFilters({
      class: '',
      section: '',
      version: '',
      department: '',
      building: ''
    });
    setSearchQuery('');
  };

  // Pagination
  const totalPages = Math.ceil(filteredRegs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRegs = filteredRegs.slice(startIndex, endIndex);

  // Get unique values for filters
  const uniqueClasses = [...new Set(allRegs.map(r => r.class))].filter(Boolean).sort((a, b) => a - b);
  const uniqueSections = [...new Set(allRegs.map(r => r.section))].filter(Boolean).sort();
  const uniqueVersions = [...new Set(allRegs.map(r => r.version))].filter(Boolean);
  const uniqueDepartments = [...new Set(allRegs.map(r => r.department))].filter(Boolean);
  const uniqueBuildings = [...new Set(allRegs.map(r => r.building))].filter(Boolean);

  // LOGIN SCREEN
  if (!token || !adminInfo) {
    return (
      <div className="admin-verify-login">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              <Building size={48} />
            </div>
            <h2>Building Admin Login</h2>
            <p>Verify student registrations for your building</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Username</label>
              <input 
                value={credentials.username} 
                onChange={e => setCredentials(p => ({...p, username: e.target.value}))}
                placeholder="Enter username" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={credentials.password} 
                onChange={e => setCredentials(p => ({...p, password: e.target.value}))}
                placeholder="Enter password" 
                required 
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          {message && <div className="login-message">{message}</div>}
        </div>
      </div>
    );
  }

  // MAIN UI
  return (
    <div className="admin-verify-page">
      <div className="admin-header">
        <div className="header-left">
          <h1>Registration Verification</h1>
          <p>Building: <strong>{adminInfo.building}</strong> • Admin: <strong>{adminInfo.username}</strong></p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {message && (
        <div className="status-message">
          {message}
        </div>
      )}

      <div className="controls-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, phone, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <Filter size={16} />
            <span>Filters:</span>
          </div>
          
          <select value={filters.class} onChange={(e) => setFilters({...filters, class: e.target.value})}>
            <option value="">All Classes</option>
            {uniqueClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>

          <select value={filters.section} onChange={(e) => setFilters({...filters, section: e.target.value})}>
            <option value="">All Sections</option>
            {uniqueSections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select value={filters.version} onChange={(e) => setFilters({...filters, version: e.target.value})}>
            <option value="">All Versions</option>
            {uniqueVersions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>

          <select value={filters.department} onChange={(e) => setFilters({...filters, department: e.target.value})}>
            <option value="">All Departments</option>
            {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select value={filters.building} onChange={(e) => setFilters({...filters, building: e.target.value})}>
            <option value="">All Buildings</option>
            {uniqueBuildings.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          {(searchQuery || Object.values(filters).some(v => v)) && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All
            </button>
          )}
        </div>

        <div className="results-info">
          Showing {currentRegs.length} of {filteredRegs.length} registrations
          {filteredRegs.length !== allRegs.length && ` (filtered from ${allRegs.length} total)`}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading registrations...</p>
        </div>
      ) : currentRegs.length === 0 ? (
        <div className="empty-state">
          <User size={64} />
          <h3>No registrations found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="registrations-grid">
            {currentRegs.map(reg => (
              <div key={reg._id} className="registration-card">
                <div className="card-header">
                  <div className="student-name">
                    <User size={20} />
                    <h3>{reg.name}</h3>
                  </div>
                  <span className="reg-id">#{reg._id.slice(-6)}</span>
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <Mail size={16} />
                    <span>{reg.email}</span>
                  </div>
                  <div className="info-row">
                    <Phone size={16} />
                    <span>{reg.contactNumber}</span>
                  </div>
                  <div className="info-row">
                    <BookOpen size={16} />
                    <span>Class {reg.class} - {reg.section}</span>
                  </div>
                  <div className="info-row">
                    <Building size={16} />
                    <span>{reg.building}</span>
                  </div>
                  
                  <div className="tags-row">
                    <span className="tag version">{reg.version}</span>
                    <span className="tag department">{reg.department}</span>
                  </div>

                  {reg.code && (
                    <div className="code-section">
                      <strong>Code:</strong> {reg.code}
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <button 
                    className="approve-btn"
                    onClick={() => onApprove(reg._id)}
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
                Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`page-number ${page === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
