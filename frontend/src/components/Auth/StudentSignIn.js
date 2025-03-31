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
} from '@mui/material';
import axios from '../../utils/axios';
import { useNavigate, useLocation } from 'react-router-dom';

const StudentSignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
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
    <Container maxWidth="md" sx={{ mt: '100px', mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Student Sign In
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
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
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 2 }}
              >
                Sign In
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default StudentSignIn; 