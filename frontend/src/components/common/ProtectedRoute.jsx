import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Skeleton from './Skeleton';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="container section" style={{ minHeight: '60vh' }}>
        <Skeleton height="50px" style={{ marginBottom: '20px' }} />
        <Skeleton height="150px" style={{ marginBottom: '20px' }} />
        <Skeleton height="80px" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
