import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  Container,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import axios from '../../utils/axios';
import { useNavigate, useLocation } from 'react-router-dom';

const StudentSignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Add these lines for mobile detection
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Get the redirect URL from query parameters if it exists
  const params = new URLSearchParams(location.search);
  const redirectUrl = params.get('redirect') || '/student/dashboard';
  
  const [formData, setFormData] = useState({
    email: '',
    studentId: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [signInMethod, setSignInMethod] = useState(0); // 0 for email (now first), 1 for direct

  // Update the useEffect to check for auth status
  useEffect(() => {
    // If already authenticated, redirect
    const studentId = localStorage.getItem('studentId');
    if (studentId) {
      navigate(redirectUrl);
    }
  }, [navigate, redirectUrl]);

  const handleTabChange = (event, newValue) => {
    setSignInMethod(newValue);
    setError('');
    setSuccess('');
    setEmailSent(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setEmailSent(false);
    
    try {
      if (signInMethod === 1) {
        // Direct sign-in method - requires both email and student ID
        if (!formData.email || !formData.studentId) {
          throw new Error('Email and Student ID are required for direct sign-in');
        }
        
        const response = await axios.post('/api/student/direct-signin/', {
          email: formData.email,
          student_id: formData.studentId,
          remember_me: rememberMe
        });
        
        // Store authentication data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('studentId', response.data.student_id);
        localStorage.setItem('userType', 'student');
        
        setSuccess('Sign in successful! Redirecting...');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate(redirectUrl);
        }, 1000);
      } else {
        // Email link method - only requires email
        if (!formData.email) {
          throw new Error('Email is required');
        }
        
        const response = await axios.post('/api/student/signin/', {
          email: formData.email,
          remember_me: rememberMe
        });
        
        setSuccess('Please check your email for the verification link.');
        setEmailSent(true);
      }
    } catch (error) {
      if (error.message) {
        setError(error.message);
      } else {
        setError(error.response?.data?.error || 'Sign in failed. Please try again.');
      }
      setEmailSent(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        mt: isMobile ? 3 : 8,
        mb: 4,
        p: isMobile ? 2 : 4
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: isMobile ? 3 : 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography 
            component="h1" 
            variant={isMobile ? "h5" : "h4"} 
            align="center"
            gutterBottom
          >
            Student Sign In
          </Typography>
          
          <Box sx={{ width: '100%', mb: 3 }}>
            <Tabs
              value={signInMethod}
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="Sign in method tabs"
              sx={{
                '& .MuiTab-root': { py: 1.5 },
                '& .Mui-selected': { color: '#DEA514' },
                '& .MuiTabs-indicator': { backgroundColor: '#DEA514' }
              }}
            >
              <Tab icon={<EmailIcon />} label="Email Link" />
              <Tab icon={<PersonIcon />} label="Direct Sign In" />
            </Tabs>
          </Box>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  helperText="Enter your school email address"
                  disabled={loading}
                />
              </Grid>
              
              {/* Only show Student ID field for direct sign-in method */}
              {signInMethod === 1 && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Student ID"
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    required
                    disabled={loading}
                    helperText="Required for direct sign-in"
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Remember Me"
                  sx={{ mb: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading || (signInMethod === 0 && emailSent)}
                  sx={{
                    mt: 1,
                    mb: 2,
                    bgcolor: (signInMethod === 0 && emailSent) ? '#4caf50' : '#DEA514',
                    '&:hover': { bgcolor: (signInMethod === 0 && emailSent) ? '#388e3c' : '#B88A10' },
                    height: '48px' // Fixed height to prevent jumping
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (signInMethod === 0 && emailSent) ? (
                    'Email Sent'
                  ) : signInMethod === 1 ? (
                    'Sign In'
                  ) : (
                    'Send Sign-In Link'
                  )}
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          <Box sx={{ mt: 2, width: '100%', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {signInMethod === 1 
                ? "Sign in directly with your student credentials" 
                : "Receive a sign-in link via email"}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default StudentSignIn;