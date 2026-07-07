import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthToken } from '../utils/api';

const ProtectedRoute = ({ children, user, loading }) => {
  const token = getAuthToken();

  if (loading) {
    return (
      <div className="loader-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
