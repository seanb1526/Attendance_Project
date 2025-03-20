import React, { useState } from 'react';
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

const FacultySignIn = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('/api/faculty/signin/', {
        email: email
      });
      
      setSuccess('Please check your email for the sign-in link.');
      setEmail('');
    } catch (error) {
      setError(error.response?.data?.error || 'Sign in failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: '100px', mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Faculty Sign In
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Faculty Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="Enter your faculty email address"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 2 }}
              >
                Send Sign In Link
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default FacultySignIn; 