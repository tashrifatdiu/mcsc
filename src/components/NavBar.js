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
        if (data && Array.isArray(data.courses)) setCourses(data.courses.slice(0, 8));
      } catch (err) {
        console.log('Failed to fetch courses:', err);
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsMenuOpen(false);
        setIsCoursesOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleCoursesDropdown = () => {
    setIsCoursesOpen(!isCoursesOpen);
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsCoursesOpen(false);
  };

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('mcsc_user');
      localStorage.removeItem('mcsc_token');
      setUser(null);
      closeAllMenus();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  return (
    <nav className="navbar" ref={navRef}>
      <div className="nav-container">
        {/* Logo and Brand */}
        <div className="nav-brand">
          <img src={logo} alt="Club Logo" className="nav-logo" />
          <span className="brand-text">MCSC</span>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          
          <div className="dropdown">
            <button 
              className="nav-link dropdown-btn"
              onMouseEnter={() => setIsCoursesOpen(true)}
              onMouseLeave={() => setIsCoursesOpen(false)}
            >
              Courses ▼
            </button>
            {isCoursesOpen && courses.length > 0 && (
              <div 
                className="dropdown-menu"
                onMouseEnter={() => setIsCoursesOpen(true)}
                onMouseLeave={() => setIsCoursesOpen(false)}
              >
                {courses.map(course => (
                  <Link 
                    key={course._id} 
                    to={`/courses#${course._id}`} 
                    className="dropdown-item"
                    onClick={closeAllMenus}
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
          <Link to="/events/future" className="nav-link">Upcoming</Link>
          <Link to="/registration-request" className="nav-link">Register</Link>
          <Link to="/admin-verify" className="nav-link">Admin</Link>
        </div>

        {/* User Section */}
        <div className="nav-user">
          {user ? (
            <div className="user-info">
              <Link to="/dashboard" className="user-btn">
                <div className="user-avatar">
                  {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                <span className="user-name">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </span>
              </Link>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/signup" className="signup-btn">Sign Up</Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <Link to="/" className="mobile-link" onClick={closeAllMenus}>Home</Link>
        
        <div className="mobile-dropdown">
          <button 
            className="mobile-link dropdown-toggle"
            onClick={toggleCoursesDropdown}
          >
            Courses {isCoursesOpen ? '▲' : '▼'}
          </button>
          <div className={`dropdown-content ${isCoursesOpen ? 'show' : ''}`}>
            {courses.map(course => (
              <Link 
                key={course._id} 
                to={`/courses#${course._id}`} 
                className="dropdown-item-mobile"
                onClick={closeAllMenus}
              >
                {course.title}
              </Link>
            ))}
          </div>
        </div>

        <Link to="/journal" className="mobile-link" onClick={closeAllMenus}>Journal</Link>
        <Link to="/journal/gallery" className="mobile-link" onClick={closeAllMenus}>Gallery</Link>
        <Link to="/events/past" className="mobile-link" onClick={closeAllMenus}>Past Events</Link>
        <Link to="/events/future" className="mobile-link" onClick={closeAllMenus}>Upcoming Events</Link>
        <Link to="/registration-request" className="mobile-link" onClick={closeAllMenus}>Registration</Link>
        <Link to="/admin-verify" className="mobile-link" onClick={closeAllMenus}>Admin Verify</Link>
        
        {!user && (
          <>
            <Link to="/login" className="mobile-link" onClick={closeAllMenus}>Login</Link>
            <Link to="/signup" className="mobile-link" onClick={closeAllMenus}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;