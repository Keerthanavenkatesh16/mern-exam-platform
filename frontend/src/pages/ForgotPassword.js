import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
  // ─── Original state — UNCHANGED ───────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // ─── Original handleSubmit — UNCHANGED ────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} id="forgot-password-form">
        <h2>Forgot password</h2>
        <p className="auth-subtitle">We'll send a reset link to your email.</p>
        {message && <div className="alert alert-info">ℹ️ {message}</div>}
        <label htmlFor="fp-email">Email</label>
        <input
          id="fp-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <button className="btn btn-primary" type="submit" disabled={loading} id="btn-fp-submit">
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
        <div className="auth-footer">
          <Link to="/login">← Back to login</Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
