import React from 'react';
import { Container, Typography, Box, Button, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

const AuthLanding = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ pt: 15, pb: 8, bgcolor: '#F5F5DC' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          align="center"
          sx={{ mb: 6, color: '#2C2C2C' }}
        >
          Welcome to TrueAttend
        </Typography>
        <Typography
          variant="h5"
          align="center"
          sx={{ mb: 8, color: '#2C2C2C', opacity: 0.85 }}
        >
          Choose your role to continue
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                height: '100%',
                cursor: 'pointer',
                bgcolor: '#FFFFFF',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <AccountBoxIcon sx={{ fontSize: 60, color: '#DEA514' }} />
              <Typography variant="h5" component="h2" sx={{ mt: 2, mb: 2, color: '#2C2C2C' }}>
                Faculty
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Access your dashboard to manage events, track attendance, and generate reports.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" sx={{ mr: 2 }}>
                  Sign In
                </Button>
                <Button variant="outlined">
                  Register
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                height: '100%',
                cursor: 'pointer',
                bgcolor: '#FFFFFF',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <SchoolIcon sx={{ fontSize: 60, color: '#DEA514' }} />
              <Typography variant="h5" component="h2" sx={{ mt: 2, mb: 2, color: '#2C2C2C' }}>
                Student
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Sign in to view and register for events, and manage your attendance records.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" sx={{ mr: 2 }}>
                  Sign In
                </Button>
                <Button variant="outlined">
                  Register
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AuthLanding;