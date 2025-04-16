/**
 * Authentication utility functions
 */

export const saveToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const getToken = () => {
  return localStorage.getItem('authToken');
};

// Helper to clear all authentication tokens from localStorage
export const clearToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('studentId');
  localStorage.removeItem('facultyId');
  localStorage.removeItem('schoolId');
  localStorage.removeItem('adminId');
  localStorage.removeItem('adminRole');
  localStorage.removeItem('userType');
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const isAuthenticated = () => {
  return (
    localStorage.getItem('authToken') !== null && 
    (localStorage.getItem('studentId') !== null || 
     localStorage.getItem('facultyId') !== null ||
     localStorage.getItem('adminId') !== null)
  );
};

export const getUserType = () => {
  return localStorage.getItem('userType');
};
