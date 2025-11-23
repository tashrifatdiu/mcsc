import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';
import './NavBar.css';
import { supabase } from '../lib/supabase';
import logo from './mcsclogo.png';

const NavBar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const navRef = useRef(null);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch((process.env.REACT_APP_API_BASE || 'http://localhost:5000').replace(/\/$/, '') + '/api/courses');
        const data = await res.json().catch(() => null);
        if (!mounted) return;
        if (data && Array.isArray(data.courses)) setCourses(data.courses.slice(0, 10));
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Load current user on mount and subscribe to auth changes
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(data?.user ?? null);
      } catch (err) {
        console.warn('Failed to get supabase user', err);
      }
    }

    loadUser();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      if (sub && typeof sub.subscription?.unsubscribe === 'function') {
        sub.subscription.unsubscribe();
      } else if (sub?.unsubscribe) {
        sub.unsubscribe();
      }
    };
  }, []);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (!navRef.current?.contains(e.target)) {
        setIsMenuOpen(false);
        setIsCoursesOpen(false);
      }
    }

    function handleEscapeKey(e) {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsCoursesOpen(false);
      }
    }

    if (isMenuOpen || isCoursesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMenuOpen, isCoursesOpen]);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      try {
        localStorage.removeItem('mcsc_user');
        localStorage.removeItem('mcsc_token');
        sessionStorage.removeItem('mcsc_user');
        sessionStorage.removeItem('mcsc_supabase_session');
      } catch (err) {
        // ignore
      }
      setUser(null);
      setIsMenuOpen(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar-container">
        {/* Logo and Brand */}
        <div className="navbar-brand">
          <img src={logo} alt="Club Logo" className="navbar-logo" />
          <span className="navbar-brand-text">MCSC</span>
        </div>

        {/* Desktop Navigation - Centered */}
        <div className="navbar-links-center">
          <Link to="/" className="nav-link">Home</Link>
          
          <div 
            className="nav-dropdown-container"
            onMouseEnter={() => setIsCoursesOpen(true)}
            onMouseLeave={() => setIsCoursesOpen(false)}
          >
            <button className="nav-link nav-dropdown-trigger">
              Courses
              <span className={`dropdown-arrow ${isCoursesOpen ? 'open' : ''}`}>▼</span>
            </button>
            {courses.length > 0 && (
              <div className={`nav-dropdown ${isCoursesOpen ? 'open' : ''}`}>
                {courses.map(course => (
                  <Link 
                    key={course._id} 
                    to={`/courses#${course._id}`} 
                    className="dropdown-link"
                    onClick={() => setIsCoursesOpen(false)}
                  >
                    {course.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/journal" className="nav-link">Journal</Link>
          <Link to="/journal/gallery" className="nav-link">Gallery</Link>
          <Link to="/events/past" className="nav-link">Past Events</Link>
          <Link to="/events/future" className="nav-link">Upcoming Events</Link>
          <Link to="/registration-request" className="nav-link">Registration</Link>
          <Link to="/admin-verify" className="nav-link">Admin Verify</Link>
        </div>

        {/* User Section */}
        <div className="navbar-user-section">
          {user ? (
            <div className="user-menu">
              <Link 
                to="/dashboard" 
                className="user-button"
              >
                <span className="user-avatar">
                  {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
                <span className="user-name">
                  {user.user_metadata?.full_name || user.email || 'Dashboard'}
                </span>
              </Link>
              <button 
                className="logout-button" 
                onClick={handleLogout}
                aria-label="Logout"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-button login-button">Login</Link>
              <Link to="/signup" className="auth-button signup-button">Sign Up</Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-button ${isMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
          <span className="mobile-nav-icon">🏠</span>
          Home
        </Link>
        
        <div className="mobile-dropdown">
          <button 
            className="mobile-nav-link mobile-dropdown-trigger"
            onClick={() => setIsCoursesOpen(!isCoursesOpen)}
          >
            <span className="mobile-nav-icon">📚</span>
            Courses
            <span className={`dropdown-arrow ${isCoursesOpen ? 'open' : ''}`}>▼</span>
          </button>
          <div className={`mobile-dropdown-content ${isCoursesOpen ? 'open' : ''}`}>
            {courses.map(course => (
              <Link 
                key={course._id} 
                to={`/courses#${course._id}`} 
                className="mobile-dropdown-link"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsCoursesOpen(false);
                }}
              >
                {course.title}
              </Link>
            ))}
          </div>
        </div>

        <Link to="/journal" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
          <span className="mobile-nav-icon">📖</span>
          Journal
        </Link>
        <Link to="/journal/gallery" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
          <span className="mobile-nav-icon">🖼️</span>
          Gallery
        </Link>
        <Link to="/events/past" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
          <span className="mobile-nav-icon">📅</span>
          Past Events
        </Link>
        <Link to="/events/future" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
          <span className="mobile-nav-icon">⏩</span>
          Upcoming Events
        </Link>
        <Link to="/registration-request" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
          <span className="mobile-nav-icon">📝</span>
          Registration
        </Link>
        <Link to="/admin-verify" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
          <span className="mobile-nav-icon">🔒</span>
          Admin Verify
        </Link>
        
        {!user && (
          <>
            <Link to="/login" className="mobile-nav-link auth-link" onClick={() => setIsMenuOpen(false)}>
              <span className="mobile-nav-icon">🔑</span>
              Login
            </Link>
            <Link to="/signup" className="mobile-nav-link auth-link" onClick={() => setIsMenuOpen(false)}>
              <span className="mobile-nav-icon">👤</span>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;