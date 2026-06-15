import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../services/api';
import '../../css/auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  
  // Local dev helpers to mock email link clicking
  const [devResetLink, setDevResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSending(true);
    setDevResetLink('');
    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      if (data.success) {
        toast.success(data.message);
        
        // Expose dev reset link so they can click it directly without actual SMTP config
        if (data.resetLink) {
          setDevResetLink(data.resetLink);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email lookup failed.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">Enter your email and we'll generate a password recovery path</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={sending}>
            {sending ? 'Sending request...' : 'Send Recovery Link'}
          </button>
        </form>

        {devResetLink && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: 'rgba(30, 144, 255, 0.15)',
            border: '1px solid var(--info)',
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}>
            <strong style={{ display: 'block', color: 'var(--info)', marginBottom: '8px' }}>[Local Development Helper]</strong>
            <p style={{ marginBottom: '12px' }}>Because mail services aren't live locally, you can click this simulated token link directly to test:</p>
            <a
              href={devResetLink}
              style={{
                color: 'var(--primary)',
                fontWeight: 700,
                textDecoration: 'underline',
                wordBreak: 'break-all'
              }}
            >
              Simulate Email Click &rarr;
            </a>
          </div>
        )}

        <p className="auth-footer-link">
          Remember credentials? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
