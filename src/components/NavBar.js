import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';
import './NavBar.css'; // Import the CSS file for styles
import { supabase } from '../lib/supabase';
import logo from './mcsclogo.png';

const NavBar = () => {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // fetch course list for dropdown
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
      // unsubscribe
      if (sub && typeof sub.subscription?.unsubscribe === 'function') {
        sub.subscription.unsubscribe();
      } else if (sub?.unsubscribe) {
        sub.unsubscribe();
      }
    };
  }, []);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function onDocClick(e) {
      if (!navRef.current) return;
      if (open && !navRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    function onKey(e) {
      if (e.key === 'Escape' && open) setOpen(false);
    }

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('touchstart', onDocClick);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      // Remove any local storage you used for session copies
      try {
        localStorage.removeItem('mcsc_user');
        localStorage.removeItem('mcsc_token');
        sessionStorage.removeItem('mcsc_user');
        sessionStorage.removeItem('mcsc_supabase_session');
      } catch (err) {
        // ignore
      }
      setUser(null);
      setOpen(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="site-nav" role="navigation" ref={navRef}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="brand">
         <img src={logo} alt="Club Logo" style={{ height: '40px', verticalAlign: 'middle' }} />

        </div>
        <button
          className="nav-toggle btn btn-ghost"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          ☰
        </button>
      </div>

      <div className={`nav-links ${open ? 'open' : 'collapsed'}`}>
        <Link to="/" onClick={() => setOpen(false)}>Home</Link>
        <div className="nav-item-with-dropdown">
          <Link to="/courses" onClick={() => setOpen(false)}>Courses</Link>
          {courses.length > 0 && (
            <div className="nav-dropdown">
              {courses.map(c => <Link key={c._id} to={`/courses#${c._id}`} onClick={() => setOpen(false)}>{c.title}</Link>)}
            </div>
          )}
        </div>
        <Link to="/journal" onClick={() => setOpen(false)}>Journal</Link>
        <Link to="/journal/gallery" onClick={() => setOpen(false)}>Gallery</Link>
        <Link to="/events/past" onClick={() => setOpen(false)}>Past Events</Link>
        <Link to="/events/future" onClick={() => setOpen(false)}>Upcoming Events</Link>
        <Link to="/registration-request" onClick={() => setOpen(false)}>Registration Request</Link>
        <Link to="/admin-verify" onClick={() => setOpen(false)}>Admin Verify</Link>
        {!user && <Link to="/login" onClick={() => setOpen(false)}>Login</Link>}
        {!user && <Link to="/signup" onClick={() => setOpen(false)}>Sign Up</Link>}
      </div>

      <div style={{ marginLeft: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
        {user ? (
          <>
            <Link
              to="/dashboard"
              style={{
                color: '#fff',
                backgroundColor: '#28a745', // Updated color to a green shade
                padding: '8px 16px',
                borderRadius: '20px',
                textDecoration: 'none',
                fontWeight: 'bold',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              {user.user_metadata?.full_name || user.email || 'Dashboard'}
            </Link>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : null}
      </div>

      <style>
        {`
            .site-nav {
              background: #333;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              padding: 10px 20px;
            }

            .site-nav .brand {
              font-size: 1.5rem;
              font-weight: bold;
              color: white;
              text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
            }

            .nav-links a {
              color: white;
              font-weight: 500;
              padding: 8px 12px;
              border-radius: 4px;
              transition: background-color 0.3s, transform 0.2s;
            }

            .nav-links a:hover {
              background-color: rgba(255, 255, 255, 0.2);
              transform: scale(1.05);
            }

            .nav-toggle {
              color: white;
              font-size: 1.2rem;
              border: none;
              background: none;
              cursor: pointer;
              transition: transform 0.2s;
            }

            .nav-toggle:hover {
              transform: scale(1.1);
            }

            .nav-item-with-dropdown:hover .nav-dropdown {
              display: block;
            }

            .nav-dropdown {
              display: none;
              position: absolute;
              background: #444;
              color: white;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              border-radius: 4px;
              padding: 10px;
              z-index: 1000;
            }

            .nav-dropdown a {
              color: white;
              padding: 5px 10px;
              display: block;
              border-radius: 4px;
              transition: background-color 0.3s;
            }

            .nav-dropdown a:hover {
              background-color: #555;
            }

            .navbar {
              background-color: #333;
              padding: 10px 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .nav-container {
              display: flex;
              align-items: center;
              width: 100%;
            }

            .nav-brand {
              flex-grow: 1;
            }

            .brand-text {
              color: white;
              font-size: 1.5rem;
              font-weight: bold;
              text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
            }

            .dropdown-toggle {
              background: none;
              border: none;
              color: white;
              font-size: 1.2rem;
              cursor: pointer;
              padding: 10px;
              transition: transform 0.2s;
            }

            .dropdown-toggle:hover {
              transform: scale(1.1);
            }

            .dropdown-menu {
              display: flex;
              flex-direction: column;
              position: absolute;
              background: #444;
              color: white;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              border-radius: 4px;
              padding: 10px;
              z-index: 1000;
              top: 60px;
              right: 20px;
            }

            .dropdown-item {
              color: white;
              padding: 10px;
              text-decoration: none;
              border-radius: 4px;
              transition: background-color 0.3s;
            }

            .dropdown-item:hover {
              background-color: #555;
            }

          @media (max-width: 768px) {
            .site-nav {
              flex-direction: column;
              padding: 10px;
            }

            .nav-links {
              display: flex;
              flex-direction: column;
              gap: 10px;
            }

            .nav-links a {
              font-size: 1rem;
              padding: 10px;
            }

            .nav-toggle {
              font-size: 1.5rem;
            }

            .dropdown-menu {
              width: 100%;
              top: 50px;
              right: 0;
            }
          }

          @media (min-width: 769px) {
            .site-nav {
              flex-direction: row;
              justify-content: space-between;
            }

            .nav-links {
              display: flex;
              flex-direction: row;
              gap: 20px;
            }

            .nav-links a {
              font-size: 1.2rem;
              padding: 8px 12px;
            }
          }
        `}
      </style>
    </nav>
  );
};

export default NavBar;