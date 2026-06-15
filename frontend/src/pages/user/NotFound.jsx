import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div
      className="flex-center"
      style={{
        flexDirection: 'column',
        minHeight: '70vh',
        textAlign: 'center',
        padding: '0 20px'
      }}
    >
      <FiAlertTriangle style={{ fontSize: '5rem', color: 'var(--primary)', marginBottom: '24px' }} />
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '-1px' }}>404 - Page Not Found</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: '32px' }}>
        The page or department you are looking for does not exist, has been removed, or has had its name changed.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
