import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import logo from './mcsclogo.png';
import './NavBar.css';

const NavBar = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
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
      if (sub?.unsubscribe) {
        sub.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (!navRef.current?.contains(e.target)) {
        setMenuOpen(false);
        setCoursesDropdownOpen(false);
      }
    }

    function onKey(e) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setCoursesDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

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
      setMenuOpen(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  const handleLinkClick = () => {
    setMenuOpen(false);
    setCoursesDropdownOpen(false);
  };

  return (
    <nav className="navbar" ref={navRef} role="navigation">
      {/* Logo */}
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="Club Logo" />
      </Link>

      {/* Mobile Menu Toggle */}
      <button
        className={`hamburger ${menuOpen ? 'active' : ''}`}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Navigation Links */}
      <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
        <Link to="/" className="nav-link" onClick={handleLinkClick}>Home</Link>

        <div className="nav-dropdown-wrapper">
            <Link to="/courses" ><button
            className="nav-link dropdown-toggle"
            onClick={() => setCoursesDropdownOpen(!coursesDropdownOpen)}
            aria-expanded={coursesDropdownOpen}
          >
           
           Courses
            <span className="dropdown-arrow">▼</span>
          </button> </Link>
          
          {courses.length > 0 && (
            <div className={`dropdown-content ${coursesDropdownOpen ? 'active' : ''}`}>
              {courses.map(c => (
                <Link
                  key={c._id}
                  to={`/courses/${c._id}`}
                  className="dropdown-item"
                  onClick={handleLinkClick}
                >
                  {c.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link to="/journal" className="nav-link" onClick={handleLinkClick}>Journal</Link>
        <Link to="/journal/gallery" className="nav-link" onClick={handleLinkClick}>Gallery</Link>
        <Link to="/events/past" className="nav-link" onClick={handleLinkClick}>Past Events</Link>
        <Link to="/events/future" className="nav-link" onClick={handleLinkClick}>Upcoming</Link>
        <Link to="/registration-request" className="nav-link" onClick={handleLinkClick}>Register</Link>
        <Link to="/admin-verify" className="nav-link" onClick={handleLinkClick}>Verify</Link>

        {!user && (
          <>
            <Link to="/login" className="nav-link" onClick={handleLinkClick}>Login</Link>
            <Link to="/signup" className="nav-link signup-link" onClick={handleLinkClick}>Sign Up</Link>
          </>
        )}

        {user && (
          <>
            <Link
              to="/dashboard"
              className="nav-link dashboard-link"
              onClick={handleLinkClick}
            >
              {user.user_metadata?.full_name || user.email || 'Dashboard'}
            </Link>
            <button className="nav-link logout-link" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;