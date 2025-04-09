import React, { useEffect } from 'react';
import { Container, Typography, Box, Button, Paper, Grid, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import PersonIcon from '@mui/icons-material/Person';

const AuthLanding = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Check if user is already authenticated and redirect accordingly
  useEffect(() => {
    const facultyId = localStorage.getItem('facultyId');
    const studentId = localStorage.getItem('studentId');
    
    if (facultyId) {
      navigate('/faculty/dashboard');
    } else if (studentId) {
      navigate('/student/dashboard');
    }
  }, [navigate]);

  // Function to handle faculty sign-in button click
  const handleFacultySignIn = () => {
    const facultyId = localStorage.getItem('facultyId');
    if (facultyId) {
      navigate('/faculty/dashboard');
    } else {
      navigate('/auth/faculty/signin');
    }
  };

  // Function to handle student sign-in button click
  const handleStudentSignIn = () => {
    const studentId = localStorage.getItem('studentId');
    if (studentId) {
      navigate('/student/dashboard');
    } else {
      navigate('/auth/student/signin');
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      bgcolor: '#F5F5DC',
      px: isMobile ? 2 : 0,
      py: 6
    }}>
      <Container maxWidth="lg" sx={{ width: '100%' }}>
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
          Welcome to TrueAttend
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
          Choose your role to continue
        </Typography>
        
        <Box sx={{ maxWidth: '1100px', mx: 'auto' }}>
          <Grid 
            container 
            spacing={4} 
            justifyContent="center"
            alignItems="stretch"
          >
            <Grid item xs={12} sm={10} md={6}>
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  cursor: 'pointer',
                  bgcolor: '#FFFFFF',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: isMobile ? 'none' : 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <PersonIcon sx={{ 
                  fontSize: 56, 
                  color: '#DEA514' 
                }} />
                <Typography 
                  variant="h5" 
                  component="h2" 
                  sx={{ 
                    mt: 3, 
                    mb: 2, 
                    color: '#2C2C2C',
                    fontSize: '1.5rem'
                  }}
                >
                  Faculty
                </Typography>
                <Typography 
                  color="text.secondary" 
                  sx={{ 
                    mb: 4,
                    fontSize: '1rem',
                    maxWidth: '320px',
                    mx: 'auto'
                  }}
                >
                  Access your dashboard to manage events and track attendance.
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ mr: 2 }}
                    onClick={handleFacultySignIn}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => navigate('/auth/faculty/register')}
                  >
                    Register
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={10} md={6}>
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  bgcolor: '#FFFFFF',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: isMobile ? 'none' : 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <SchoolIcon sx={{ 
                  fontSize: 56,
                  color: '#DEA514' 
                }} />
                <Typography 
                  variant="h5" 
                  component="h2" 
                  sx={{ 
                    mt: 3, 
                    mb: 2, 
                    color: '#2C2C2C',
                    fontSize: '1.5rem'
                  }}
                >
                  Student
                </Typography>
                <Typography 
                  color="text.secondary" 
                  sx={{ 
                    mb: 4,
                    fontSize: '1rem',
                    maxWidth: '320px',
                    mx: 'auto'
                  }}
                >
                  Sign in to view events and manage your attendance records.
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ mr: 2 }}
                    onClick={handleStudentSignIn}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => navigate('/auth/student/register')}
                  >
                    Register
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLanding;