import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const StudentProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('studentId') !== null;
  
  if (!isAuthenticated) {
    // Redirect to sign in, but save the current location to redirect back after authentication
    return <Navigate to={`/student/signin?redirect=${encodeURIComponent(location.pathname + location.search)}`} />;
  }
  
  return children;
};

export default StudentProtectedRoute; 