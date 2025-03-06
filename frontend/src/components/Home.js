import React from 'react';
import { Container, Typography, Box, Button, Grid, Paper, useTheme, useMediaQuery } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: '#F5F5DC', // Soft Beige background
          pt: isMobile ? 12 : 15, // Increased to account for fixed navbar
          pb: isMobile ? 6 : 10,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={isMobile ? 4 : 6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h1" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontSize: { 
                    xs: '2rem',
                    sm: '2.5rem', 
                    md: '3.5rem' 
                  },
                  fontWeight: 'bold',
                  color: '#2C2C2C',
                  textAlign: isMobile ? 'center' : 'left',
                  '& span': {
                    color: '#DEA514', // New Saffron
                  }
                }}
              >
                Make Attendance <span>Simple</span> and <span>Reliable</span>
              </Typography>
              <Typography 
                variant="h5" 
                paragraph
                sx={{ 
                  mb: 4,
                  color: '#2C2C2C',
                  opacity: 0.85,
                  fontSize: { 
                    xs: '1rem',
                    sm: '1.25rem' 
                  },
                  textAlign: isMobile ? 'center' : 'left',
                }}
              >
                Transform your event attendance tracking with QR codes and automated processing. Perfect for managing extra credit events.
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'flex-start',
              }}>
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to="/register"
                  fullWidth={isMobile}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={RouterLink}
                  to="/about"
                  fullWidth={isMobile}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              {/* Add illustration here */}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ 
        py: isMobile ? 6 : 10, 
        bgcolor: '#FFFFFF',
        px: isMobile ? 2 : 0
      }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{ 
              mb: isMobile ? 4 : 8,
              color: '#2C2C2C',
              fontWeight: 600,
              fontSize: isMobile ? '2rem' : '3rem',
              '& span': {
                color: '#DEA514', // New Saffron
              }
            }}
          >
            Why Choose <span>TrueAttend</span>?
          </Typography>
          <Grid container spacing={isMobile ? 3 : 4}>
            {[
              {
                icon: <QrCodeScannerIcon sx={{ fontSize: 60, color: '#DEA514', mb: 2 }} />,
                title: 'Easy QR Code Sign-In',
                description: 'Students can quickly sign in to events using their phones, eliminating paper sign-in sheets.'
              },
              {
                icon: <AutoAwesomeIcon sx={{ fontSize: 60, color: '#DEA514', mb: 2 }} />,
                title: 'Automated Processing',
                description: 'Receive organized, formatted lists of attending students, sorted by class and section.'
              },
              {
                icon: <VerifiedUserIcon sx={{ fontSize: 60, color: '#DEA514', mb: 2 }} />,
                title: 'Reliable Verification',
                description: 'Ensure attendance authenticity with our secure QR code system and real-time verification.'
              }
            ].map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    bgcolor: '#F5F5DC',
                    height: '100%',
                    borderRadius: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  {feature.icon}
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom
                    sx={{ color: '#2C2C2C', fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography sx={{ color: '#2C2C2C', opacity: 0.85 }}>
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 