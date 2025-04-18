import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  Container,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';

const FacultyRegister = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    school: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch schools list
    axios.get('/api/schools/')
      .then(response => setSchools(response.data))
      .catch(error => console.error('Error fetching schools:', error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await axios.post('/api/faculty/register/', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        school: formData.school,
      });

      setSuccess(response.data.message || 'Registration successful. Please check your email.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        school: '',
      });
      setLoading(false); // Reset loading state on success
    } catch (error) {
      console.error('Registration error:', error.response?.data || error);
      setError(error.response?.data?.email?.[0] || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: '100px', mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Faculty Registration
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={loading || !!success}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={loading || !!success}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                helperText="Use your faculty email address"
                disabled={loading || !!success}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                select
                label="School"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                disabled={loading || !!success}
              >
                {schools.map((school) => (
                  <MenuItem key={school.id} value={school.id}>
                    {school.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  mt: 2,
                  height: '48px',
                  bgcolor: success ? '#4caf50' : '#DEA514',
                  '&:hover': {
                    bgcolor: success ? '#388e3c' : '#B88A10',
                  }
                }}
                disabled={loading || !!success}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : success ? (
                  'Registration Complete'
                ) : (
                  'Register'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default FacultyRegister;