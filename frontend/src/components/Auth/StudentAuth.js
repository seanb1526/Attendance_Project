import React, { useEffect } from 'react';
import { Container, Typography, Box, Button, Paper, Grid, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';

const StudentAuth = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Check if user is already authenticated as a student and redirect accordingly
  useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    if (studentId) {
      navigate('/student/dashboard');
    }
  }, [navigate]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      bgcolor: '#F5F5DC',
      px: isMobile ? 2 : 0,
      py: 6,
      pt: { xs: 5, sm: 6 }, // Reduced top padding by half
      mt: { xs: 1, sm: 2 }  // Reduced top margin by half
    }}>
      <Container maxWidth="md" sx={{ width: '100%' }}>
        <Typography
          variant="h2"
          align="center"
          sx={{ 
            mb: 3, 
            color: '#2C2C2C',
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: 'bold'
          }}
        >
          Student Portal
        </Typography>
        <Typography
          variant="h5"
          align="center"
          sx={{ 
            mb: 5, 
            color: '#2C2C2C', 
            opacity: 0.85,
            fontSize: isMobile ? '1.1rem' : '1.3rem'
          }}
        >
          Sign in or register to access attendance features
        </Typography>
        
        <Box sx={{ maxWidth: '650px', mx: 'auto' }}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 4 },
              textAlign: 'center',
              height: '100%',
              bgcolor: '#FFFFFF',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderRadius: 2,
            }}
          >
            <SchoolIcon sx={{ 
              fontSize: { xs: 48, sm: 64 },
              color: '#DEA514' 
            }} />
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                mt: 3, 
                mb: 2, 
                color: '#2C2C2C',
                fontSize: { xs: '1.3rem', sm: '1.5rem' }
              }}
            >
              Student
            </Typography>
            <Typography 
              color="text.secondary" 
              sx={{ 
                mb: 4,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                maxWidth: '420px',
                mx: 'auto'
              }}
            >
              Access your attendance records, scan QR codes for events, and manage your student profile.
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="contained" 
                  fullWidth
                  size="large"
                  onClick={() => navigate('/auth/student/signin')}
                  sx={{
                    bgcolor: '#DEA514',
                    '&:hover': {
                      bgcolor: '#B88A10',
                    },
                    py: { xs: 1.2, sm: 1.5 }
                  }}
                >
                  Sign In
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  size="large"
                  onClick={() => navigate('/auth/student/register')}
                  sx={{
                    borderColor: '#DEA514',
                    color: '#DEA514',
                    '&:hover': {
                      borderColor: '#B88A10',
                      color: '#B88A10',
                      bgcolor: 'rgba(222, 165, 20, 0.04)'
                    },
                    py: { xs: 1.2, sm: 1.5 }
                  }}
                >
                  Register
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default StudentAuth;
