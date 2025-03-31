import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Alert, Container, Button, useTheme, useMediaQuery } from '@mui/material';
import axios from '../../utils/axios';

// Function to decode JWT token
const decodeToken = (token) => {
  try {
    // Split the token into parts
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (middle part)
    const payload = parts[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const EmailVerification = () => {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', or 'error'
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Add these lines for mobile detection
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Get userType from localStorage in component
  const userType = localStorage.getItem('userType') || 'student';

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
        
        // Save IDs from response or decoded token
        if (userType === 'faculty') {
          // Option 1: Get from response if included
          if (response.data.faculty_id) {
            localStorage.setItem('facultyId', response.data.faculty_id);
            localStorage.setItem('schoolId', response.data.school_id);
          } 
          // Option 2: Decode from token
          else {
            const decodedToken = decodeToken(token);
            if (decodedToken && decodedToken.faculty_id) {
              localStorage.setItem('facultyId', decodedToken.faculty_id);
            }
          }
        } else if (userType === 'student' && response.data.student_id) {
          localStorage.setItem('studentId', response.data.student_id);
        }
        
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        
        // After successful verification, check for redirect
        const params = new URLSearchParams(location.search);
        const redirectUrl = params.get('redirect');
        
        // Handle redirect based on user type
        if (userType === 'student') {
          navigate(redirectUrl || '/student/dashboard');
        } else if (userType === 'faculty') {
          navigate(redirectUrl || '/faculty/dashboard');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Email verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [location, navigate]);

  // For the navigation function:
  const goToDashboard = () => {
    const currentUserType = localStorage.getItem('userType') || 'student';
    navigate(currentUserType === 'faculty' ? '/faculty/dashboard' : '/student/dashboard');
  };

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          mt: isMobile ? 4 : 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: isMobile ? 2 : 4
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: isMobile ? 3 : 4,
            width: '100%',
            borderRadius: 2
          }}
        >
          {status === 'verifying' && (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={isMobile ? 40 : 50} />
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                sx={{ mt: 2 }}
              >
                Verifying your email...
              </Typography>
            </Box>
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
          
          {/* Make buttons full width on mobile */}
          <Button
            variant="contained"
            fullWidth={isMobile}
            onClick={goToDashboard}
            sx={{
              mt: 3,
              bgcolor: '#DEA514',
              '&:hover': { bgcolor: '#B88A10' }
            }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default EmailVerification; 