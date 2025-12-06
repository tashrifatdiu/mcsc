import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../pages/AdminEvents.css';

export default function AdminEventsTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    date: '',
    location: '',
    shortDescription: '',
    description: '',
    coverImage: '',
    images: '',
    color: 'from-indigo-400 to-purple-600',
    glow: 'shadow-indigo-500/50',
    status: 'upcoming'
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    try {
      const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/events`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      setMessage('Failed to load events');
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
      const url = editingEvent 
        ? `${API_BASE}/api/events/${editingEvent.slug}`
        : `${API_BASE}/api/events`;
      
      const method = editingEvent ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        images: formData.images ? formData.images.split(',').map(s => s.trim()) : []
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save event');
      }

      setMessage(editingEvent ? 'Event updated!' : 'Event created!');
      setShowModal(false);
      setEditingEvent(null);
      resetForm();
      loadEvents();
    } catch (err) {
      setMessage(err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(slug) {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    setLoading(true);
    try {
      const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/events/${slug}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete event');
      }

      setMessage('Event deleted!');
      loadEvents();
    } catch (err) {
      setMessage(err.message || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(event) {
    setEditingEvent(event);
    
    setFormData({
      title: event.title,
      slug: event.slug,
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      location: event.location || '',
      shortDescription: event.shortDescription || '',
      description: event.description || '',
      coverImage: event.coverImage || '',
      images: event.images ? event.images.join(', ') : '',
      color: event.color || 'from-indigo-400 to-purple-600',
      glow: event.glow || 'shadow-indigo-500/50',
      status: event.status || 'upcoming'
    });
    setShowModal(true);
  }

  function openCreateModal() {
    setEditingEvent(null);
    resetForm();
    setShowModal(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      slug: '',
      date: '',
      location: '',
      shortDescription: '',
      description: '',
      coverImage: '',
      images: '',
      color: 'from-indigo-400 to-purple-600',
      glow: 'shadow-indigo-500/50',
      status: 'upcoming'
    });
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Manage Events</h2>
        <button className="create-btn" onClick={openCreateModal}>
          <Plus size={20} />
          Create Event
        </button>
      </div>

      {message && (
        <div className="status-message">{message}</div>
      )}

      {loading && !showModal ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <div key={event._id} className="event-card">
              {event.coverImage && (
                <div className="event-image">
                  <img src={event.coverImage} alt={event.title} />
                </div>
              )}
              <div className="event-content">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <span className={`status-badge ${event.status}`}>
                    {event.status}
                  </span>
                </div>
                <p className="event-date">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="event-location">{event.location}</p>
                <p className="event-description">{event.shortDescription}</p>
                <div className="event-actions">
                  <button className="edit-btn" onClick={() => openEditModal(event)}>
                    <Edit size={16} />
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(event.slug)}>
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
              <h2>{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Slug * (URL-friendly)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  placeholder="science-festival-2025"
                  required
                  disabled={!!editingEvent}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Short Description *</label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                  rows="2"
                  required
                  placeholder="Brief description of the event"
                />
              </div>

              <div className="form-group">
                <label>Full Description *</label>
                <div style={{ minHeight: '200px' }}>
                  <ReactQuill
                    theme="snow"
                    value={formData.description}
                    onChange={(value) => setFormData({...formData, description: value})}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link'],
                        ['clean']
                      ]
                    }}
                    placeholder="Full event description with details"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Cover Image URL</label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label>Additional Images (comma-separated URLs)</label>
                <textarea
                  value={formData.images}
                  onChange={(e) => setFormData({...formData, images: e.target.value})}
                  rows="2"
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
