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
  CircularProgress,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import axios from '../../utils/axios';

const AdminSignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect URL from query parameters if it exists
  const params = new URLSearchParams(location.search);
  const redirectUrl = params.get('redirect') || '/admin/dashboard';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if already authenticated and redirect
  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    if (adminId) {
      navigate(redirectUrl);
    }
  }, [navigate, redirectUrl]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // This is just a placeholder for the API call
      // Replace with your actual API endpoint
      const response = await axios.post('/api/admin/signin/', {
        email: formData.email,
        password: formData.password,
        remember_me: rememberMe
      });
      
      // Store authentication data
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('adminId', response.data.admin_id);
      localStorage.setItem('adminRole', response.data.role); // 'master', 'co', or 'sub'
      localStorage.setItem('userType', 'admin');
      
      if (response.data.school_id) {
        localStorage.setItem('schoolId', response.data.school_id);
      }
      
      // Redirect to admin dashboard
      navigate(redirectUrl);
      
    } catch (error) {
      setError(error.response?.data?.error || 'Sign in failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        mt: 8,
        mb: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <AdminPanelSettingsIcon sx={{ fontSize: 64, color: '#DEA514', mb: 2 }} />
          <Typography component="h1" variant="h5" gutterBottom>
            Administrator Sign In
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please enter your admin credentials
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                      disabled={loading}
                    />
                  }
                  label="Remember me"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    mb: 2,
                    bgcolor: '#DEA514',
                    '&:hover': { bgcolor: '#B88A10' },
                    height: '48px'
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminSignIn;
