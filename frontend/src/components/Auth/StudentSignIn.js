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
    
    try {
      const response = await axios.post('/api/student/signin/', {
        email: formData.email,
        student_id: formData.studentId,
      });
      
      setSuccess('Please check your email for the verification link.');
      setFormData({ email: '', studentId: '' });
    } catch (error) {
      setError(error.response?.data?.error || 'Sign in failed. Please try again.');
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
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student ID"
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    bgcolor: '#DEA514',
                    '&:hover': { bgcolor: '#B88A10' }
                  }}
                >
                  Sign In
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