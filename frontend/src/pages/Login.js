import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Role-to-home mapping
const roleHome = { admin: '/admin', faculty: '/faculty', student: '/student' };

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Visual-only: shake animation state
  const [shake, setShake] = useState(false);
  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(roleHome[user.role] || '/');
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null);
      setError(serverMsg || 'Login failed. Please check your credentials or network connection.');
      setShake(true);
      setTimeout(() => setShake(false), 450);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Quick Demo Credentials Bar */}
        <div className="demo-accounts-card">
          <div className="demo-header">
            <span className="demo-header-title">⚡ Instant Demo Logins</span>
            <span className="demo-tag">1-Click Auto-Fill</span>
          </div>
          <p className="demo-subtitle">
            Select a role to instantly populate verified demo credentials:
          </p>
          <div className="demo-buttons-grid">
            <button
              type="button"
              className={`btn-demo-pill student ${email === 'student@example.com' ? 'active' : ''}`}
              onClick={() => handleDemoFill('student@example.com', 'Student@123')}
            >
              <div className="role-icon">🧑‍🎓</div>
              <div className="role-info">
                <span className="role-title">Student Portal</span>
                <span className="role-cred">student@example.com</span>
              </div>
            </button>

            <button
              type="button"
              className={`btn-demo-pill faculty ${email === 'faculty@example.com' ? 'active' : ''}`}
              onClick={() => handleDemoFill('faculty@example.com', 'Faculty@123')}
            >
              <div className="role-icon">👨‍🏫</div>
              <div className="role-info">
                <span className="role-title">Faculty Studio</span>
                <span className="role-cred">faculty@example.com</span>
              </div>
            </button>

            <button
              type="button"
              className={`btn-demo-pill admin ${email === 'admin@example.com' ? 'active' : ''}`}
              onClick={() => handleDemoFill('admin@example.com', 'Admin@123')}
            >
              <div className="role-icon">🛡️</div>
              <div className="role-info">
                <span className="role-title">Platform Admin</span>
                <span className="role-cred">admin@example.com</span>
              </div>
            </button>
          </div>
          <div className="demo-footer-note">
            <span>💡 <em>Passwords are case-sensitive with a capital letter (e.g. <code>Student@123</code>).</em></span>
          </div>
        </div>

        {/* Main Sign-In Card */}
        <form
          ref={formRef}
          className={`auth-card${shake ? ' shake' : ''}`}
          onSubmit={handleSubmit}
          id="login-form"
        >
          <div className="auth-card-header">
            <div className="auth-badge-shield">🛡️</div>
            <h2>Sign in</h2>
            <p className="auth-subtitle">Secure Digital Assessment Platform</p>
          </div>

          {error && <div className="alert alert-error" role="alert">⚠️ {error}</div>}

          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                id="btn-toggle-password"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-submit-auth" type="submit" disabled={loading} id="btn-login-submit">
            {loading ? 'Authenticating Securely…' : 'Sign in to Platform'}
          </button>

          <div className="auth-security-badge">
            <span>🔒 256-Bit TLS Encrypted · Academic Integrity Guaranteed</span>
          </div>

          <div className="auth-footer">
            <Link to="/forgot-password">Forgot password?</Link>
            <span> · </span>
            <Link to="/register">Create an account</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
