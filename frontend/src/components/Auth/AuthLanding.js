import React from 'react';
import { Container, Typography, Box, Button, Paper, Grid, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

const AuthLanding = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      <Container maxWidth="lg">
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
        
        <Grid container spacing={4} sx={{ maxWidth: '1100px', mx: 'auto' }}>
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
                  transform: isMobile ? 'none' : 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <AccountBoxIcon sx={{ 
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
              <Box sx={{ 
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2,
                justifyContent: 'center'
              }}>
                <Button 
                  variant="contained" 
                  fullWidth={isMobile}
                  component={RouterLink}
                  to="/faculty/dashboard"
                  sx={{
                    bgcolor: '#DEA514',
                    '&:hover': {
                      bgcolor: '#B88A10',
                    }
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  variant="outlined"
                  fullWidth={isMobile}
                  sx={{
                    borderColor: '#DEA514',
                    color: '#DEA514',
                    '&:hover': {
                      borderColor: '#B88A10',
                      color: '#B88A10',
                    }
                  }}
                >
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
              <Box sx={{ 
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2,
                justifyContent: 'center'
              }}>
                <Button 
                  variant="contained"
                  fullWidth={isMobile}
                  component={RouterLink}
                  to="/auth/student/signin"
                  sx={{
                    bgcolor: '#DEA514',
                    '&:hover': {
                      bgcolor: '#B88A10',
                    }
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  variant="outlined"
                  fullWidth={isMobile}
                  component={RouterLink}
                  to="/auth/student/register"
                  sx={{
                    borderColor: '#DEA514',
                    color: '#DEA514',
                    '&:hover': {
                      borderColor: '#B88A10',
                      color: '#B88A10',
                    }
                  }}
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