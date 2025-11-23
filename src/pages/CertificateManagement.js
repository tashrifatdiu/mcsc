import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function CertificateManagement() {
  const [certificates, setCertificates] = useState([]);
  const [form, setForm] = useState({ searchId: '', name: '', servingEvent: '', code: '', class: '', hscBatch: '' });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  async function loadCertificates() {
    try {
      const res = await fetch(`${API_BASE}/api/certificates`);
      const data = await res.json();
      setCertificates(data.certificates || []);
    } catch (err) {
      console.error('Failed to load certificates', err);
    }
  }

  async function handleAddCertificate() {
    try {
      const res = await fetch(`${API_BASE}/api/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add certificate');
      setMessage('Certificate added successfully');
      setForm({ searchId: '', name: '', servingEvent: '', code: '', class: '', hscBatch: '' });
      loadCertificates();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleDeleteCertificate(id) {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/certificates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete certificate');
      setMessage('Certificate deleted successfully');
      loadCertificates();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '20px auto' }}>
      <h2>Certificate Management</h2>
      {message && <div className="status">{message}</div>}

      <div style={{ marginBottom: 20 }}>
        <h3>Add Certificate</h3>
        <label>Search ID:
          <input value={form.searchId} onChange={(e) => setForm({ ...form, searchId: e.target.value })} />
        </label>
        <label>Name:
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>Serving Event:
          <input value={form.servingEvent} onChange={(e) => setForm({ ...form, servingEvent: e.target.value })} />
        </label>
        <label>Code:
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        </label>
        <label>Class:
          <input value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} />
        </label>
        <label>HSC Batch:
          <input value={form.hscBatch} onChange={(e) => setForm({ ...form, hscBatch: e.target.value })} />
        </label>
        <button onClick={handleAddCertificate}>Add Certificate</button>
      </div>

      <div>
        <h3>Existing Certificates</h3>
        {certificates.length === 0 ? (
          <p>No certificates found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Search ID</th>
                <th>Name</th>
                <th>Serving Event</th>
                <th>Code</th>
                <th>Class</th>
                <th>HSC Batch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert._id}>
                  <td>{cert.searchId}</td>
                  <td>{cert.name}</td>
                  <td>{cert.servingEvent}</td>
                  <td>{cert.code}</td>
                  <td>{cert.class}</td>
                  <td>{cert.hscBatch}</td>
                  <td>
                    <button onClick={() => handleDeleteCertificate(cert._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}