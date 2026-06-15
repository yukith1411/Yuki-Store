import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import '../../css/auth.css';

const AdminLogin = () => {
  const { login, logout, isAuthenticated, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // If already an admin, redirect immediately
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warn('Please enter email and password');
      return;
    }

    setLoggingIn(true);
    const res = await login(email, password);

    if (res.success) {
      // Need to load role from response context
      setLoggingIn(false);
      // AuthContext state updates asynchronously, so we redirect in useEffect or do it here on check
    } else {
      setLoggingIn(false);
      toast.error(res.message);
    }
  };

  return (
    <div className="auth-page-wrapper" style={{ minHeight: '80vh' }}>
      <div className="auth-card">
        <h2 className="auth-title" style={{ color: 'var(--primary)' }}>Admin Portal</h2>
        <p className="auth-subtitle">Provide credentials to access management suite</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. admin@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loggingIn}>
            {loggingIn ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
