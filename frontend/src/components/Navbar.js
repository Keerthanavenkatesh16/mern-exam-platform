import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── Dark-mode preference: persisted in localStorage, applied to <html> ──────
const getInitialTheme = () => {
  const stored = localStorage.getItem('theme');
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(getInitialTheme);
  const [scrolled, setScrolled] = useState(false);

  // Apply theme to <html data-theme>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const homePath =
    user?.role === 'admin' ? '/admin' : user?.role === 'faculty' ? '/faculty' : '/student';

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const badgeClass = user ? `badge badge-${user.role}` : 'badge';

  const roleEmoji = user?.role === 'admin' ? '🛡️' : user?.role === 'faculty' ? '👨‍🏫' : '🧑‍🎓';

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-left">
        <Link to={user ? homePath : '/'} className="navbar-brand">
          <span className="navbar-brand-icon">🛡️</span>
          <span className="navbar-title">Secure Assessment</span>
          <span className="navbar-tag">PROCTOR SECURE</span>
        </Link>

        {user && (
          <div className="navbar-nav-links">
            {user.role === 'student' && (
              <>
                <Link
                  to="/student"
                  className={`nav-link-item ${location.pathname === '/student' ? 'active' : ''}`}
                >
                  My Exams
                </Link>
                <Link
                  to="/student/results"
                  className={`nav-link-item ${location.pathname === '/student/results' ? 'active' : ''}`}
                >
                  Results & Certificates
                </Link>
              </>
            )}

            {user.role === 'faculty' && (
              <>
                <Link
                  to="/faculty"
                  className={`nav-link-item ${location.pathname === '/faculty' ? 'active' : ''}`}
                >
                  Exams Dashboard
                </Link>
                <Link
                  to="/faculty/question-banks"
                  className={`nav-link-item ${location.pathname.includes('question-bank') ? 'active' : ''}`}
                >
                  Question Banks
                </Link>
                <Link
                  to="/faculty/exam/new"
                  className={`nav-link-item ${location.pathname.includes('/exam/new') ? 'active' : ''}`}
                >
                  + New Exam
                </Link>
              </>
            )}

            {user.role === 'admin' && (
              <Link
                to="/admin"
                className={`nav-link-item ${location.pathname === '/admin' ? 'active' : ''}`}
              >
                Platform Overview
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="navbar-links">
        {user ? (
          <>
            <div className="navbar-user-chip">
              <span className="user-avatar-icon">{roleEmoji}</span>
              <div className="user-meta-text">
                <span className="user-name-line">{user.name}</span>
                <span className={badgeClass}>{user.role}</span>
              </div>
            </div>
            <button className="btn btn-outline btn-logout-nav" onClick={handleLogout} id="btn-logout">
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-auth-link">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          id="btn-theme-toggle"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
