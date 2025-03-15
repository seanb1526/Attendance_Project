import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import axios from '../../utils/axios';

const StudentSignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    studentId: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Student Sign In
      </Typography>

      <Paper sx={{ p: 3 }}>
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
              >
                Sign In
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default StudentSignIn; 