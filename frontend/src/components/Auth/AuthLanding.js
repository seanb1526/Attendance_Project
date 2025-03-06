import React from 'react';
import { Container, Typography, Box, Button, Paper, Grid, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

const AuthLanding = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      pt: isMobile ? 12 : 15, 
      pb: isMobile ? 6 : 8, 
      bgcolor: '#F5F5DC',
      px: isMobile ? 2 : 0
    }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          align="center"
          sx={{ 
            mb: 4, 
            color: '#2C2C2C',
            fontSize: isMobile ? '2rem' : '3rem'
          }}
        >
          Welcome to TrueAttend
        </Typography>
        <Typography
          variant="h5"
          align="center"
          sx={{ 
            mb: isMobile ? 4 : 8, 
            color: '#2C2C2C', 
            opacity: 0.85,
            fontSize: isMobile ? '1.1rem' : '1.5rem'
          }}
        >
          Choose your role to continue
        </Typography>
        
        <Grid container spacing={isMobile ? 3 : 4}>
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: isMobile ? 3 : 4,
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
              <AccountBoxIcon sx={{ 
                fontSize: isMobile ? 40 : 60, 
                color: '#DEA514' 
              }} />
              <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                  mt: 2, 
                  mb: 2, 
                  color: '#2C2C2C',
                  fontSize: isMobile ? '1.25rem' : '1.5rem'
                }}
              >
                Faculty
              </Typography>
              <Typography 
                color="text.secondary" 
                sx={{ 
                  mb: 3,
                  fontSize: isMobile ? '0.9rem' : '1rem'
                }}
              >
                Access your dashboard to manage events, track attendance, and generate reports.
              </Typography>
              <Box sx={{ 
                mt: 2,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 1 : 2,
                justifyContent: 'center'
              }}>
                <Button 
                  variant="contained" 
                  fullWidth={isMobile}
                >
                  Sign In
                </Button>
                <Button 
                  variant="outlined"
                  fullWidth={isMobile}
                >
                  Register
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: isMobile ? 3 : 4,
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
              <SchoolIcon sx={{ 
                fontSize: isMobile ? 40 : 60, 
                color: '#DEA514' 
              }} />
              <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                  mt: 2, 
                  mb: 2, 
                  color: '#2C2C2C',
                  fontSize: isMobile ? '1.25rem' : '1.5rem'
                }}
              >
                Student
              </Typography>
              <Typography 
                color="text.secondary" 
                sx={{ 
                  mb: 3,
                  fontSize: isMobile ? '0.9rem' : '1rem'
                }}
              >
                Sign in to view and register for events, and manage your attendance records.
              </Typography>
              <Box sx={{ 
                mt: 2,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 1 : 2,
                justifyContent: 'center'
              }}>
                <Button 
                  variant="contained" 
                  fullWidth={isMobile}
                >
                  Sign In
                </Button>
                <Button 
                  variant="outlined"
                  fullWidth={isMobile}
                >
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