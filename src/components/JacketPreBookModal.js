import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import './JacketPreBookModal.css';

export default function JacketPreBookModal({ jacket, user, profile, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    size: jacket.sizes[0],
    transactionId: '',
    bkashNumber: '',
    deliveryAddress: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const BKASH_NUMBER = '01XXXXXXXXX'; // Replace with actual bKash number

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.transactionId || !formData.bkashNumber) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/jacket-preorders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: profile?.name || user.user_metadata?.full_name || '',
          userEmail: user.email,
          userPhone: profile?.whatsapp || '',
          jacketType: jacket.version,
          size: formData.size,
          amount: 950,
          transactionId: formData.transactionId,
          bkashNumber: formData.bkashNumber,
          studentProfile: profile ? {
            class: profile.class,
            section: profile.section,
            department: profile.department,
            version: profile.version
          } : null,
          deliveryAddress: formData.deliveryAddress,
          notes: formData.notes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit pre-order');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Pre-order error:', err);
      setError(err.message || 'Failed to submit pre-order');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
          <CheckCircle size={64} className="success-icon" />
          <h2>Pre-Order Submitted!</h2>
          <p>We will verify your payment and confirm your order soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content prebook-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <h2>Pre-Book Jacket</h2>
        <p className="modal-subtitle">{jacket.name}</p>

        <div className="payment-instructions">
          <h3>Payment Instructions:</h3>
          <ol>
            <li>Send <strong>৳950</strong> to bKash: <strong>{BKASH_NUMBER}</strong></li>
            <li>Copy the Transaction ID from bKash</li>
            <li>Paste it below and submit</li>
          </ol>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="prebook-form">
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              value={profile?.name || user?.user_metadata?.full_name || ''}
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              type="text"
              value="৳950"
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="form-group">
            <label>Select Size *</label>
            <select
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              required
            >
              {jacket.sizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>bKash Transaction ID *</label>
            <input
              type="text"
              placeholder="Enter transaction ID (e.g., 9AB12CD3EF)"
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Your bKash Number *</label>
            <input
              type="tel"
              placeholder="01XXXXXXXXX"
              value={formData.bkashNumber}
              onChange={(e) => setFormData({ ...formData, bkashNumber: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Delivery Address (Optional)</label>
            <textarea
              placeholder="Enter your delivery address"
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
              rows="2"
            />
          </div>

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              placeholder="Any special instructions"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="2"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Pre-Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
