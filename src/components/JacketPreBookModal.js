import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import './JacketPreBookModal.css';
import paymentQR from '../pages/images/payment_qr.jpg';

export default function JacketPreBookModal({ jacket, preselectedSize, user, profile, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    size: preselectedSize || jacket.sizes[0],
    transactionId: '',
    bkashNumber: '',
    campus: 'Main Campus',
    building: profile?.building || '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const BKASH_NUMBER = '01842577966';

  // Size measurements (chest/length in inches)
  const sizeMeasurements = {
    'S': '38/27',
    'M': '40/28',
    'L': '42/29',
    'XL': '44/30',
    '2XL': '46/31'
  };

  // Building options based on campus
  const buildingOptions = {
    'Main Campus': ['Main Building', 'Building 27', 'Building 22', 'Building 07'],
    'Permanent Campus': ['Project 1', 'Project 2', 'Project 3', 'Project 4', 'Project 5', 'Project 6', 'Project 7']
  };

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
          deliveryAddress: `${formData.campus} - ${formData.building}`,
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

        <div className="payment-instructions-box">
          <div className="payment-step-header">
            <span className="step-badge">STEP 1</span>
            <h3>Make Payment First</h3>
          </div>
          
          <div className="bkash-payment-box">
            <div className="bkash-logo">📱 bKash</div>
            <div className="payment-method-highlight">
              <span className="method-label">⚠️ Use "Make Payment" Option</span>
              <span className="method-note">(NOT "Send Money")</span>
            </div>
            <div className="payment-amount">৳950</div>
            
            <div className="payment-options">
              <div className="payment-option">
                <div className="bkash-number-display">
                  <span className="label">Make Payment To:</span>
                  <div className="number-box">{BKASH_NUMBER}</div>
                  <button 
                    type="button"
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(BKASH_NUMBER);
                      alert('Number copied!');
                    }}
                  >
                    📋 Copy Number
                  </button>
                </div>
              </div>
              
              <div className="payment-divider">OR</div>
              
              <div className="payment-option">
                <div className="qr-code-section">
                  <span className="label">Scan QR Code:</span>
                  <img src={paymentQR} alt="Payment QR Code" className="payment-qr-image" />
                </div>
              </div>
            </div>
          </div>

          {!paymentConfirmed ? (
            <div className="payment-confirmation-section">
              <button 
                type="button"
                className="confirm-payment-btn"
                onClick={() => setPaymentConfirmed(true)}
              >
                ✅ I Have Completed the Payment
              </button>
              <p className="confirmation-note">
                Click the button above after you've made the payment
              </p>
            </div>
          ) : (
            <>
              <div className="payment-step-header">
                <span className="step-badge">STEP 2</span>
                <h3>Enter Transaction Details Below</h3>
              </div>
              
              <div className="important-note">
                ⚠️ <strong>Important:</strong> Enter the Transaction ID you received from bKash
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {paymentConfirmed && (
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
            <label>Select Size * (Chest/Length in inches)</label>
            <select
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              required
            >
              {jacket.sizes.map(size => (
                <option key={size} value={size}>
                  {size} - {sizeMeasurements[size] || 'N/A'}
                </option>
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
            <label>Delivery Campus *</label>
            <select
              value={formData.campus}
              onChange={(e) => setFormData({ ...formData, campus: e.target.value, building: buildingOptions[e.target.value][0] })}
              required
            >
              <option value="Main Campus">Main Campus</option>
              <option value="Permanent Campus">Permanent Campus</option>
            </select>
          </div>

          <div className="form-group">
            <label>Delivery Building *</label>
            <select
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              required
            >
              {buildingOptions[formData.campus].map(building => (
                <option key={building} value={building}>{building}</option>
              ))}
            </select>
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
        )}
      </div>
    </div>
  );
}
