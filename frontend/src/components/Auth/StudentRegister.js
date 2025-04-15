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
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';

const StudentRegister = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
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
      const response = await axios.post('/api/student/register/', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        student_id: formData.studentId,
        email: formData.email,
        school: formData.school,
      });

      setSuccess(response.data.message || 'Registration successful. Please check your email.');
      // Clear form but stay on the page
      setFormData({
        firstName: '',
        lastName: '',
        studentId: '',
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
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Student Registration
      </Typography>

      <Paper sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
                disabled={loading || !!success}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
                disabled={loading || !!success}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Student ID"
                value={formData.studentId}
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                required
                disabled={loading || !!success}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                helperText="Use your school email address"
                disabled={loading || !!success}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="School"
                value={formData.school}
                onChange={(e) => setFormData({...formData, school: e.target.value})}
                required
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
                variant="contained"
                fullWidth
                disabled={loading || !!success}
                sx={{
                  height: '48px',
                  bgcolor: success ? '#4caf50' : '#DEA514',
                  '&:hover': {
                    bgcolor: success ? '#388e3c' : '#B88A10',
                  }
                }}
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
    </Box>
  );
};

export default StudentRegister;