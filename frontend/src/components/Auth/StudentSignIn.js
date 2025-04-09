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
} from '@mui/material';
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

  // Update the useEffect to check for auth status
  useEffect(() => {
    // If already authenticated, redirect
    const studentId = localStorage.getItem('studentId');
    if (studentId) {
      navigate(redirectUrl);
    }
  }, [navigate, redirectUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setEmailSent(false);
    
    try {
      const response = await axios.post('/api/student/signin/', {
        email: formData.email,
        student_id: formData.studentId,
      });
      
      setSuccess('Please check your email for the verification link.');
      setEmailSent(true);
      // Don't clear the form if there's an error, so users can try again
      // setFormData({ email: '', studentId: '' });
    } catch (error) {
      setError(error.response?.data?.error || 'Sign in failed. Please try again.');
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
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center" 
            paragraph
            sx={{ mb: 3 }}
          >
            Enter your email and student ID to sign in
          </Typography>
          
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student ID"
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading || emailSent}
                  sx={{
                    mt: 3,
                    mb: 2,
                    bgcolor: emailSent ? '#4caf50' : '#DEA514',
                    '&:hover': { bgcolor: emailSent ? '#388e3c' : '#B88A10' },
                    height: '48px' // Fixed height to prevent jumping
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : emailSent ? (
                    'Email Sent'
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default StudentSignIn;