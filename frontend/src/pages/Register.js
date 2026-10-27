import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  // ─── Original state — UNCHANGED ───────────────────────────────────────────
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    course: '',
    rollNumber: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Visual-only shake state
  const [shake, setShake] = useState(false);

  // ─── Original update helper — UNCHANGED ───────────────────────────────────
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  // ─── Original handleSubmit logic — UNCHANGED ──────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'faculty' ? '/faculty' : '/student');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        (err.message === 'Network Error'
          ? 'Network error: Unable to connect to backend server. Please verify that the backend server is running on port 5000.'
          : null) ||
        err.message ||
        'Registration failed.';
      setError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 450);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form
        className={`auth-card${shake ? ' shake' : ''}`}
        onSubmit={handleSubmit}
        id="register-form"
      >
        <h2>Create account</h2>

        {error && <div className="alert alert-error" role="alert">⚠️ {error}</div>}

        <label htmlFor="reg-name">Full name</label>
        <input id="reg-name" value={form.name} onChange={update('name')} required placeholder="Jane Smith" />

        <label htmlFor="reg-email">Email</label>
        <input id="reg-email" type="email" value={form.email} onChange={update('email')} required placeholder="you@example.com" autoComplete="email" />

        <label htmlFor="reg-password">Password</label>
        <div className="password-input-wrapper">
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={update('password')}
            minLength={6}
            required
            autoComplete="new-password"
            placeholder="Min 6 characters"
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
            id="btn-toggle-reg-password"
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

        <label htmlFor="reg-role">I am a</label>
        <select id="reg-role" value={form.role} onChange={update('role')}>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
        </select>

        <label htmlFor="reg-department">Department</label>
        <input id="reg-department" value={form.department} onChange={update('department')} placeholder="e.g. Computer Science" />

        {form.role === 'student' && (
          <>
            <label htmlFor="reg-course">Course</label>
            <input id="reg-course" value={form.course} onChange={update('course')} placeholder="e.g. B.Tech" />

            <label htmlFor="reg-roll">Roll number</label>
            <input id="reg-roll" value={form.rollNumber} onChange={update('rollNumber')} placeholder="e.g. CS2021001" />
          </>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading} id="btn-register-submit">
          {loading ? 'Creating account…' : 'Register'}
        </button>

        <div className="auth-footer">
          <Link to="/login">Already have an account? Sign in</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
