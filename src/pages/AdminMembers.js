import React, { useEffect, useState } from 'react';
import { adminLogin, adminFetchMembers, adminFetchNonMembers, adminFetchMemberDetails, adminFetchUserDetails } from '../api';
import { Search, Users, UserCheck, Info, X, Mail, Phone, Building, BookOpen, LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminMembers.css';

const LOCAL_TOKEN_KEY = 'mcsc_admin_token';
const LOCAL_ADMIN_KEY = 'mcsc_admin_info';

export default function AdminMembers() {
  const navigate = useNavigate();
  const [adminInfo, setAdminInfo] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const [token, setToken] = useState(localStorage.getItem(LOCAL_TOKEN_KEY) || null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [members, setMembers] = useState([]);
  const [nonMembers, setNonMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('members'); // 'members' or 'non-members'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personDetails, setPersonDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => { 
    if (token && adminInfo && adminInfo.building === 'main building') {
      loadData();
    }
  }, [token, adminInfo]);

  async function loadData() {
    setLoading(true);
    setMessage('');
    try {
      const [membersRes, nonMembersRes] = await Promise.all([
        adminFetchMembers(token),
        adminFetchNonMembers(token)
      ]);
      setMembers(membersRes?.members || []);
      setNonMembers(nonMembersRes?.users || []);
    } catch (err) {
      setMessage(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      setMessage('Fill both fields');
      return;
    }
    setLoading(true);
    try {
      const res = await adminLogin(credentials.username, credentials.password);
      
      if (res.admin.building !== 'main building') {
        setMessage('Access denied. Only main building admin can view members.');
        setLoading(false);
        return;
      }
      
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
    setToken(null);
    setAdminInfo(null);
    setMembers([]);
    setNonMembers([]);
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    setMessage('Logged out');
  }

  async function viewDetails(person, isMember) {
    setSelectedPerson(person);
    setLoadingDetails(true);
    setPersonDetails(null);
    try {
      const res = isMember 
        ? await adminFetchMemberDetails(person._id, token)
        : await adminFetchUserDetails(person._id, token);
      setPersonDetails(res);
    } catch (err) {
      setMessage(err.message || 'Failed to load details');
    } finally {
      setLoadingDetails(false);
    }
  }

  function closeDetails() {
    setSelectedPerson(null);
    setPersonDetails(null);
  }

  // Filter data based on search
  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.contactNumber?.includes(searchQuery) ||
    m._id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNonMembers = nonMembers.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.whatsapp?.includes(searchQuery) ||
    u._id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // LOGIN SCREEN
  if (!token || !adminInfo || adminInfo.building !== 'main building') {
    return (
      <div className="admin-members-login">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              <Users size={48} />
            </div>
            <h2>Members Management</h2>
            <p>Main building admin only</p>
            <div className="warning">
              ⚠️ Only main building admin can view member information
            </div>
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
    <div className="admin-members-page">
      <div className="admin-header">
        <div className="header-left">
          <button className="back-to-dashboard-btn" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div>
            <h1>Members Management</h1>
            <p>Admin: <strong>{adminInfo.username}</strong></p>
          </div>
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

      <div className="tabs-section">
        <button 
          className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <Users size={18} />
          Club Members ({filteredMembers.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'non-members' ? 'active' : ''}`}
          onClick={() => setActiveTab('non-members')}
        >
          <UserCheck size={18} />
          Registered Users ({filteredNonMembers.length})
        </button>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, email, phone, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      ) : (
        <div className="members-grid">
          {activeTab === 'members' ? (
            filteredMembers.length === 0 ? (
              <div className="empty-state">
                <Users size={64} />
                <h3>No members found</h3>
                <p>Try adjusting your search</p>
              </div>
            ) : (
              filteredMembers.map(member => (
                <div key={member._id} className="member-card">
                  <div className="card-header">
                    <div className="member-name">
                      <Users size={20} />
                      <h3>{member.name}</h3>
                    </div>
                    <button className="info-btn" onClick={() => viewDetails(member, true)}>
                      <Info size={18} />
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="info-row">
                      <Mail size={16} />
                      <span>{member.email}</span>
                    </div>
                    <div className="info-row">
                      <Phone size={16} />
                      <span>{member.contactNumber}</span>
                    </div>
                    <div className="info-row">
                      <BookOpen size={16} />
                      <span>Class {member.class} - {member.section}</span>
                    </div>
                    <div className="info-row">
                      <Building size={16} />
                      <span>{member.building}</span>
                    </div>
                    <div className="tags-row">
                      <span className="tag version">{member.version}</span>
                      <span className="tag department">{member.department}</span>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            filteredNonMembers.length === 0 ? (
              <div className="empty-state">
                <UserCheck size={64} />
                <h3>No registered users found</h3>
                <p>Try adjusting your search</p>
              </div>
            ) : (
              filteredNonMembers.map(user => (
                <div key={user._id} className="member-card">
                  <div className="card-header">
                    <div className="member-name">
                      <UserCheck size={20} />
                      <h3>{user.name}</h3>
                    </div>
                    <button className="info-btn" onClick={() => viewDetails(user, false)}>
                      <Info size={18} />
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="info-row">
                      <Mail size={16} />
                      <span>{user.email || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <Phone size={16} />
                      <span>{user.whatsapp}</span>
                    </div>
                    <div className="info-row">
                      <BookOpen size={16} />
                      <span>Class {user.class} - {user.section}</span>
                    </div>
                    <div className="tags-row">
                      <span className="tag version">{user.version}</span>
                      <span className="tag department">{user.department}</span>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}

      {/* Details Modal */}
      {selectedPerson && (
        <div className="details-modal">
          <div className="modal-container">
            <div className="modal-header">
              <h2>
                {activeTab === 'members' ? <Users size={24} /> : <UserCheck size={24} />}
                {selectedPerson.name}
              </h2>
              <button className="close-btn" onClick={closeDetails}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-content">
              {loadingDetails ? (
                <div className="loading-details">
                  <div className="spinner"></div>
                  <p>Loading details...</p>
                </div>
              ) : personDetails ? (
                <>
                  <div className="details-section">
                    <h3>Personal Information</h3>
                    <div className="details-grid">
                      <div className="detail-item">
                        <label>Full Name</label>
                        <span>{selectedPerson.name}</span>
                      </div>
                      <div className="detail-item">
                        <label>Login Email</label>
                        <span>{selectedPerson.email || selectedPerson.whatsapp || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <label>Phone / WhatsApp</label>
                        <span>{selectedPerson.contactNumber || selectedPerson.whatsapp}</span>
                      </div>
                      <div className="detail-item">
                        <label>Class</label>
                        <span>Class {selectedPerson.class}</span>
                      </div>
                      <div className="detail-item">
                        <label>Section</label>
                        <span>{selectedPerson.section}</span>
                      </div>
                      <div className="detail-item">
                        <label>Department</label>
                        <span className="capitalize">{selectedPerson.department}</span>
                      </div>
                      <div className="detail-item">
                        <label>Version</label>
                        <span className="capitalize">{selectedPerson.version}</span>
                      </div>
                      {selectedPerson.building && (
                        <div className="detail-item">
                          <label>Building</label>
                          <span>{selectedPerson.building}</span>
                        </div>
                      )}
                      {selectedPerson.code && (
                        <div className="detail-item">
                          <label>Member Code</label>
                          <span className="code-badge">{selectedPerson.code}</span>
                        </div>
                      )}
                      {selectedPerson.supabaseId && (
                        <div className="detail-item">
                          <label>Supabase User ID</label>
                          <span className="mono-text">{selectedPerson.supabaseId}</span>
                        </div>
                      )}
                      {selectedPerson.createdAt && (
                        <div className="detail-item">
                          <label>Registration Date</label>
                          <span>{new Date(selectedPerson.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      )}
                      {activeTab === 'non-members' && (
                        <div className="detail-item full-width">
                          <label>Password Security</label>
                          <div className="security-note">
                            🔒 Password is securely encrypted by Supabase authentication system and cannot be retrieved in plain text. This is a security best practice to protect user accounts.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="details-section">
                    <h3>
                      <ShoppingBag size={20} />
                      Merchandise Order History ({personDetails.orders?.length || 0})
                    </h3>
                    {personDetails.orders && personDetails.orders.length > 0 ? (
                      <div className="orders-list">
                        {personDetails.orders.map(order => (
                          <div key={order._id} className="order-item">
                            <div className="order-header">
                              <div className="order-header-left">
                                <span className="order-id">Order #{order._id.slice(-6)}</span>
                                <span className="order-status">
                                  {order.status || 'Pending'}
                                </span>
                              </div>
                              <span className="order-date">
                                <Calendar size={14} />
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            
                            {/* Customer Info */}
                            <div className="order-customer-info">
                              <div className="customer-detail">
                                <strong>Name:</strong> {order.name || 'N/A'}
                              </div>
                              <div className="customer-detail">
                                <strong>Email:</strong> {order.email || 'N/A'}
                              </div>
                              <div className="customer-detail">
                                <strong>Phone:</strong> {order.phone || 'N/A'}
                              </div>
                              {order.address && (
                                <div className="customer-detail">
                                  <strong>Address:</strong> {order.address}
                                </div>
                              )}
                            </div>

                            <div className="order-details">
                              <div className="order-info">
                                <Package size={16} />
                                <span>{order.items?.length || 0} item(s)</span>
                              </div>
                              <div className="order-total">
                                Total: ৳{order.totalAmount || 0}
                              </div>
                            </div>
                            {order.items && order.items.length > 0 && (
                              <div className="order-items">
                                <div className="order-items-header">Items:</div>
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="order-product">
                                    <div className="product-info">
                                      <span className="product-name">{item.name}</span>
                                      <span className="product-details">
                                        Size: <strong>{item.size}</strong> • Qty: <strong>{item.quantity}</strong>
                                      </span>
                                    </div>
                                    <span className="product-price">৳{item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-orders">
                        <ShoppingBag size={48} />
                        <p>No orders yet</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="error-details">
                  <p>Failed to load details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
