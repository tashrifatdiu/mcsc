import React, { useEffect, useState } from 'react';
import { Users, Plus, Edit, Trash2, X, Save, User } from 'lucide-react';
import './AdminCoreMembers.css';

const LOCAL_TOKEN_KEY = 'mcsc_admin_token';
const LOCAL_ADMIN_KEY = 'mcsc_admin_info';

export default function AdminCoreMembers() {
  const [adminInfo, setAdminInfo] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const [token] = useState(localStorage.getItem(LOCAL_TOKEN_KEY) || null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    designation: '',
    image: '',
    order: 0
  });

  useEffect(() => {
    if (token && adminInfo?.building?.toLowerCase() === 'main building') {
      loadMembers();
    }
  }, [token, adminInfo]);

  async function loadMembers() {
    setLoading(true);
    try {
      const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/core-members`);
      const data = await res.json();
      setMembers(data.members || []);
    } catch (err) {
      setMessage('Failed to load members');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
      const url = editingMember 
        ? `${API_BASE}/api/core-members/${editingMember._id}`
        : `${API_BASE}/api/core-members`;
      
      const method = editingMember ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save member');
      }

      setMessage(editingMember ? 'Member updated!' : 'Member created!');
      setShowModal(false);
      setEditingMember(null);
      resetForm();
      loadMembers();
    } catch (err) {
      setMessage(err.message || 'Failed to save member');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this member?')) return;

    setLoading(true);
    try {
      const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/core-members/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete member');
      }

      setMessage('Member deleted!');
      loadMembers();
    } catch (err) {
      setMessage(err.message || 'Failed to delete member');
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(member) {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      designation: member.designation || '',
      image: member.image || '',
      order: member.order || 0
    });
    setShowModal(true);
  }

  function openCreateModal() {
    setEditingMember(null);
    resetForm();
    setShowModal(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      role: '',
      designation: '',
      image: '',
      order: 0
    });
  }

  if (!token || !adminInfo || adminInfo.building?.toLowerCase() !== 'main building') {
    return (
      <div className="admin-members-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Only Main Building admins can manage core members</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-members-page">
      <div className="admin-header">
        <div className="header-left">
          <Users size={32} />
          <div>
            <h1>Manage Core Members</h1>
            <p>Add, edit, and remove club core members</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="dashboard-btn" onClick={() => window.location.href = '/admin/dashboard'}>
            Dashboard
          </button>
          <button className="create-btn" onClick={openCreateModal}>
            <Plus size={20} />
            Add Member
          </button>
        </div>
      </div>

      {message && (
        <div className="status-message">{message}</div>
      )}

      {loading && !showModal ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading members...</p>
        </div>
      ) : (
        <div className="members-grid">
          {members.map(member => (
            <div key={member._id} className="member-card">
              <div className="member-image">
                {member.image ? (
                  <img src={member.image} alt={member.name} />
                ) : (
                  <div className="placeholder-image">
                    <User size={48} />
                  </div>
                )}
              </div>
              <div className="member-content">
                <h3>{member.name}</h3>
                <p className="member-role">{member.role}</p>
                {member.designation && (
                  <p className="member-designation">{member.designation}</p>
                )}
                <p className="member-order">Order: {member.order}</p>
                <div className="member-actions">
                  <button className="edit-btn" onClick={() => openEditModal(member)}>
                    <Edit size={16} />
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(member._id)}>
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMember ? 'Edit Member' : 'Add Member'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="member-form">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  placeholder="e.g., President, Vice President"
                  required
                />
              </div>

              <div className="form-group">
                <label>Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                  placeholder="e.g., Class 12, Science"
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label>Display Order *</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                  min="0"
                  required
                />
                <small>Lower numbers appear first</small>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
