import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import { supabase } from '../lib/supabase';
import useAuth from '../lib/useAuth';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

// Generate section options
function generateSectionOptions() {
  const sections = [];
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    sections.push(`${letter} boys`);
  }
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    sections.push(`${letter} girls`);
  }
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    sections.push(`${letter}${letter} boys`);
  }
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    sections.push(`${letter}${letter} girls`);
  }
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    sections.push(`${letter}${letter}${letter} boys`);
  }
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    sections.push(`${letter}${letter}${letter} girls`);
  }
  return sections;
}

const sectionOptions = generateSectionOptions();

const buildingOptions = [
  'main building',
  'building 22',
  'building 27',
  'building 07',
  'project 01',
  'project 02',
  'project 03',
  'project 04',
  'project 05',
  'project 06',
  'project 07'
];

const RegistrationRequest = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [form, setForm] = useState({
    code: '',
    building: 'main building',
    campus: 'main campus',
    contactNumber: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      // Wait for auth to complete before showing content
      if (authLoading) {
        return;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get access token
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch profile
        const profileRes = await fetch(
          `${API_BASE}/api/auth/profile?supabaseId=${encodeURIComponent(user.id)}`
        );
        
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (mounted) {
            setProfile(profileData.profile);
          }
        }

        // Check application status
        const statusRes = await fetch(`${API_BASE}/api/registration/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (mounted) {
            setApplicationStatus(statusData);
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [user, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!form.code || !form.contactNumber) {
      setStatus({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    if (!profile) {
      setStatus({ type: 'error', message: 'Profile not found. Please complete your profile first.' });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setStatus({ type: 'error', message: 'Not authenticated. Please login again.' });
        setSubmitting(false);
        return;
      }

      const registrationData = {
        name: profile.name,
        code: form.code.trim(),
        class: profile.class,
        section: profile.section,
        campus: form.campus,
        version: profile.version,
        department: profile.department,
        building: form.building,
        contactNumber: form.contactNumber.trim()
      };

      const response = await fetch(`${API_BASE}/api/registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus({ type: 'error', message: data.error || 'Failed to submit registration' });
        setSubmitting(false);
        return;
      }

      setStatus({ type: 'success', message: 'Registration submitted successfully! Your application is pending approval.' });
      setForm({
        code: '',
        building: 'main building',
        campus: 'main campus',
        contactNumber: ''
      });

      // Reload application status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="card" style={{ maxWidth: 800, margin: '2rem auto' }}>
        <div className="spinner"></div>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>Loading...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="card" style={{ maxWidth: 800, margin: '2rem auto', textAlign: 'center' }}>
        <h2>Club Registration</h2>
        <p style={{ marginTop: '1rem', marginBottom: '2rem' }}>
          You must be logged in to submit a club registration request.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  // No profile
  if (!profile) {
    return (
      <div className="card" style={{ maxWidth: 800, margin: '2rem auto', textAlign: 'center' }}>
        <h2>Profile Required</h2>
        <p style={{ marginTop: '1rem', marginBottom: '2rem' }}>
          You need to complete your profile before applying for club membership.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/signup')}>
          Complete Profile
        </button>
      </div>
    );
  }

  // Already has pending or approved application
  if (applicationStatus && !applicationStatus.canApply) {
    const existingApp = applicationStatus.existingApplication;
    const isApproved = existingApp.status === 'approved' || existingApp.approved === true;
    const statusText = isApproved ? 'Approved - Club Member' : 'Pending Review';
    const statusColor = isApproved ? '#10b981' : '#f59e0b';

    return (
      <div className="card" style={{ maxWidth: 800, margin: '2rem auto' }}>
        <h2>{isApproved ? 'Club Membership Status' : 'Application Status'}</h2>
        
        <div style={{
          background: `rgba(${isApproved ? '16, 185, 129' : '245, 158, 11'}, 0.1)`,
          border: `2px solid ${statusColor}`,
          borderRadius: '12px',
          padding: '2rem',
          marginTop: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            {isApproved ? '🎉' : '⏳'}
          </div>
          <h3 style={{ color: statusColor, marginBottom: '1rem', fontSize: '1.75rem' }}>
            {isApproved ? 'You are a Club Member!' : 'Application Pending'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            {isApproved 
              ? 'Congratulations! You are now an official member of the Milestone College Science Club.'
              : 'Your application is currently under review. Please wait for admin approval.'}
          </p>

          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            padding: '1.5rem',
            textAlign: 'left'
          }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Application Details:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <strong>Name:</strong> {existingApp.name}
              </div>
              <div>
                <strong>Code:</strong> {existingApp.code}
              </div>
              <div>
                <strong>Class:</strong> {existingApp.class}
              </div>
              <div>
                <strong>Section:</strong> {existingApp.section}
              </div>
              <div>
                <strong>Department:</strong> {existingApp.department.charAt(0).toUpperCase() + existingApp.department.slice(1)}
              </div>
              <div>
                <strong>Version:</strong> {existingApp.version.charAt(0).toUpperCase() + existingApp.version.slice(1)}
              </div>
              <div>
                <strong>Building:</strong> {existingApp.building}
              </div>
              <div>
                <strong>Campus:</strong> {existingApp.campus}
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Contact:</strong> {existingApp.contactNumber}
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Submitted:</strong> {new Date(existingApp.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {isApproved 
              ? 'Welcome to the club! You now have access to all club activities and resources.'
              : 'You will be notified once your application is reviewed.'}
          </p>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            {isApproved ? 'Go to Dashboard' : 'Back to Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  // Can apply (no application or declined)
  return (
    <div className="card" style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h2>Club Registration Request</h2>
      
      {applicationStatus?.status === 'declined' && (
        <div className="status warning" style={{ marginTop: '1rem' }}>
          Your previous application was declined. You can submit a new application.
        </div>
      )}

      <p style={{ marginTop: '1rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
        Please review your information and complete the registration form.
      </p>

      <form onSubmit={handleSubmit} className="form-grid">
        <h3 style={{ gridColumn: '1 / -1', marginTop: '1rem', marginBottom: '0.5rem' }}>
          Student Information (From Profile)
        </h3>

        <label>
          Full Name
          <input
            type="text"
            value={profile.name}
            readOnly
            style={{ background: 'var(--bg-tertiary)', cursor: 'not-allowed', opacity: 0.8 }}
          />
        </label>

        <label>
          Class
          <input
            type="text"
            value={profile.class}
            readOnly
            style={{ background: 'var(--bg-tertiary)', cursor: 'not-allowed', opacity: 0.8 }}
          />
        </label>

        <label>
          Section
          <input
            type="text"
            value={profile.section}
            readOnly
            style={{ background: 'var(--bg-tertiary)', cursor: 'not-allowed', opacity: 0.8 }}
          />
        </label>

        <label>
          Department
          <input
            type="text"
            value={profile.department.charAt(0).toUpperCase() + profile.department.slice(1)}
            readOnly
            style={{ background: 'var(--bg-tertiary)', cursor: 'not-allowed', opacity: 0.8 }}
          />
        </label>

        <label>
          Version
          <input
            type="text"
            value={profile.version.charAt(0).toUpperCase() + profile.version.slice(1)}
            readOnly
            style={{ background: 'var(--bg-tertiary)', cursor: 'not-allowed', opacity: 0.8 }}
          />
        </label>

        <label>
          WhatsApp Number
          <input
            type="text"
            value={profile.whatsapp}
            readOnly
            style={{ background: 'var(--bg-tertiary)', cursor: 'not-allowed', opacity: 0.8 }}
          />
        </label>

        <h3 style={{ gridColumn: '1 / -1', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          Additional Information
        </h3>

        <label>
          Student Code *
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="Enter your student code"
            required
          />
        </label>

        <label>
          Contact Number *
          <input
            type="tel"
            name="contactNumber"
            value={form.contactNumber}
            onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
            placeholder="Enter contact number"
            required
          />
        </label>

        <label>
          Campus *
          <select
            name="campus"
            value={form.campus}
            onChange={(e) => setForm({ ...form, campus: e.target.value })}
          >
            <option value="main campus">Main Campus</option>
            <option value="permanent campus">Permanent Campus</option>
          </select>
        </label>

        <label>
          Building *
          <select
            name="building"
            value={form.building}
            onChange={(e) => setForm({ ...form, building: e.target.value })}
          >
            {buildingOptions.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </label>

        <div className="full" style={{ marginTop: '1rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: '100%' }}
          >
            {submitting ? 'Submitting...' : 'Submit Registration'}
          </button>
        </div>
      </form>

      {status && (
        <div className={`status ${status.type}`} style={{ marginTop: '1rem' }}>
          {status.message}
        </div>
      )}

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '8px',
        borderLeft: '4px solid var(--accent-primary)'
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <strong>Note:</strong> Your profile information (name, class, section, department, version) cannot be changed here. 
          If you need to update your profile, please contact an administrator.
        </p>
      </div>
    </div>
  );
};

export default RegistrationRequest;
