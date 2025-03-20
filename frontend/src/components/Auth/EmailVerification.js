import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import axios from '../../utils/axios';

const EmailVerification = () => {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', or 'error'
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token and user type from the URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        const userType = queryParams.get('type') || 'student'; // Default to student for backward compatibility
        
        if (!token) {
          setStatus('error');
          setMessage('No verification token found.');
          return;
        }
        
        // Call our backend API to verify the token
        const response = await axios.get(`/api/verify-email/?token=${token}&type=${userType}`);
        
        // Store the token in localStorage for authentication
        localStorage.setItem('authToken', token);
        localStorage.setItem('userType', userType); // Store user type for redirection
        
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        
        // Redirect based on user type
        setTimeout(() => {
          if (userType === 'faculty') {
            navigate('/faculty/dashboard', { replace: true });
          } else {
            navigate('/student/dashboard', { replace: true });
          }
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.error || 
          'Verification failed. Please try again or contact support.'
        );
        console.error('Verification error:', error);
      }
    };

    verifyEmail();
  }, [location, navigate]);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        {status === 'verifying' && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Verifying your email...</Typography>
          </>
        )}
        {status === 'success' && (
          <Alert severity="success">
            {message}
            <Typography variant="body2" sx={{ mt: 1 }}>
              Redirecting to login page...
            </Typography>
          </Alert>
        )}
        {status === 'error' && (
          <Alert severity="error">
            {message}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default EmailVerification; 