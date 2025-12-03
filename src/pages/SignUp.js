import React, { useState, useEffect } from 'react';
import '../index.css';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import useAuth from '../lib/useAuth';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..4
}

// Generate section options: A-Z boys, A-Z girls, AA-ZZ boys/girls, AAA-ZZZ boys/girls
function generateSectionOptions() {
  const sections = [];
  
  // Single letters: A boys to Z boys, then A girls to Z girls
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i); // A-Z (uppercase)
    sections.push(`${letter} boys`);
  }
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    sections.push(`${letter} girls`);
  }
  
  // Double letters: AA-ZZ boys, then AA-ZZ girls
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    sections.push(`${letter}${letter} boys`);
  }
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    sections.push(`${letter}${letter} girls`);
  }
  
  // Triple letters: AAA-ZZZ boys, then AAA-ZZZ girls
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

export default function SignUp() {
  const navigate = useNavigate();
  const user = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    class: '9',
    department: 'science',
    version: 'english',
    whatsapp: '',
    section: 'A boys'
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'error'|'success', message }
  const [showPassword, setShowPassword] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setStatus(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    // Client-side validation
    if (!form.name.trim()) { setStatus({ type: 'error', message: 'Please enter your name.' }); return; }
    if (!validateEmail(form.email)) { setStatus({ type: 'error', message: 'Please enter a valid email address.' }); return; }
    if (form.password.length < 8) { setStatus({ type: 'error', message: 'Password must be at least 8 characters.' }); return; }
    if (form.password !== form.confirmPassword) { setStatus({ type: 'error', message: 'Passwords do not match.' }); return; }
    if (!form.whatsapp.trim()) { setStatus({ type: 'error', message: 'Please enter your WhatsApp number.' }); return; }

    setLoading(true);

    try {
      // Create Supabase user
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: {
            full_name: form.name.trim()
          }
        }
      });

      if (error) {
        setStatus({ type: 'error', message: error.message || 'Signup failed' });
        setLoading(false);
        return;
      }

      // data.user may be present when signUp completes immediately (no email confirmation),
      // otherwise Supabase will send an email; in either case we still save profile tied to supabaseId if available.
      const supabaseId = data?.user?.id || (data?.user ?? data)?.id || null;

      // If supabase returned a user id, send profile to backend. If it didn't (email confirm flow),
      // user won't have an id yet; you might decide to wait until confirmation or handle later via webhook.
      if (supabaseId) {
        const profileRes = await fetch(`${API_BASE}/api/auth/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supabaseId,
            email: form.email.trim().toLowerCase(),
            name: form.name.trim(),
            class: form.class,
            department: form.department,
            version: form.version,
            whatsapp: form.whatsapp.trim(),
            section: form.section
          })
        });

        const profileData = await profileRes.json();
        if (!profileRes.ok) {
          setStatus({ type: 'error', message: profileData.error || 'Failed to save profile' });
          setLoading(false);
          return;
        }
      } else {
        // Supabase requires email confirmation — still inform user
        // You may want to save a pending profile server-side via email as key — left as future step
      }

      // Always show email confirmation message
      setUserEmail(form.email.trim().toLowerCase());
      setSignupComplete(true);
      setStatus({ type: 'success', message: 'Account created successfully!' });

      // Clear sensitive fields
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        class: '9',
        department: 'science',
        version: 'english',
        whatsapp: '',
        section: 'A boys'
      });

      // Don't auto-redirect - let user read the confirmation message
    } catch (err) {
      console.error('Signup error:', err);
      setStatus({ type: 'error', message: 'Network or server error' });
    } finally {
      setLoading(false);
    }
  }

  const strength = passwordStrength(form.password);
  const strengthLabels = ['Very weak', 'Weak', 'Okay', 'Good', 'Strong'];
  const strengthColors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#0ea5a0'];

  // Show email confirmation screen after successful signup
  if (signupComplete) {
    return (
      <div className="card form-card" style={{ maxWidth: 720, margin: '20px auto', textAlign: 'center' }}>
        <div style={{ padding: '2rem 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📧</div>
          <h2 style={{ marginTop: 0, color: '#10b981' }}>Check Your Email!</h2>
          <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '1.5rem' }}>
            We've sent a confirmation email to:
          </p>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '2rem' }}>
            {userEmail}
          </p>
          <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'left' }}>
            <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#334155' }}>Next Steps:</h3>
            <ol style={{ color: '#475569', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
              <li>Open your email inbox</li>
              <li>Look for an email from Milestone College Science Club</li>
              <li>Click the confirmation link in the email</li>
              <li>Once confirmed, return here and login</li>
            </ol>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
            <strong>Important:</strong> You must confirm your email before you can login. 
            If you don't see the email, check your spam folder.
          </p>
          <button 
            onClick={() => navigate('/login')} 
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Go to Login Page
          </button>
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={() => setSignupComplete(false)} 
              className="btn btn-ghost"
            >
              Back to Signup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card form-card" style={{ maxWidth: 720, margin: '20px auto' }}>
      <h2 style={{ marginTop: 0 }}>Create an account</h2>

      <form onSubmit={handleSubmit} className="form-grid" noValidate>
        <label className="full">
          Full name
          <input name="name" value={form.name} onChange={onChange} placeholder="Your full name" autoComplete="name" required />
        </label>

        <label className="full">
          Email address
          <input name="email" value={form.email} onChange={onChange} placeholder="you@example.com" type="email" autoComplete="email" required />
        </label>

        <label>
          Class
          <select name="class" value={form.class} onChange={onChange}>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
          </select>
        </label>

        <label>
          Department
          <select name="department" value={form.department} onChange={onChange}>
            <option value="science">Science</option>
            <option value="bst">BST</option>
            <option value="arts">Arts</option>
          </select>
        </label>

        <label>
          Version
          <select name="version" value={form.version} onChange={onChange}>
            <option value="english">English</option>
            <option value="bangla">Bangla</option>
          </select>
        </label>

        <label>
          Section
          <select name="section" value={form.section} onChange={onChange}>
            {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label className="full">
          WhatsApp number
          <input name="whatsapp" value={form.whatsapp} onChange={onChange} placeholder="e.g., 01XXXXXXXXX" required />
        </label>

        <label className="full">
          Password
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="At least 8 characters"
              type={showPassword ? 'text' : 'password'}
              style={{ flex: 1 }}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="btn btn-ghost"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <label className="full">
          Confirm password
          <input name="confirmPassword" value={form.confirmPassword} onChange={onChange} placeholder="Re-enter your password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required />
        </label>

        <div className="full" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <small style={{ color: '#475569' }}>Password strength: <strong>{strengthLabels[strength]}</strong></small>
            <small style={{ color: '#94a3b8' }}>Use a mix of letters, numbers, and symbols.</small>
          </div>
          <div style={{ height: 8, background: '#eef2f7', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(strength / 4) * 100}%`, background: strengthColors[strength], transition: 'width .2s ease' }} />
          </div>
        </div>

        <div className="actions full" style={{ marginTop: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        </div>
      </form>

      {status && <div className={`status ${status.type === 'error' ? 'error' : 'success'}`} style={{ marginTop: 12 }}>{status.message}</div>}

      <div style={{ marginTop: 12, color: '#475569', fontSize: 13 }}>
        By creating an account you agree to our terms. Already have an account? <a href="/login">Log in</a>
      </div>
    </div>
  );
}