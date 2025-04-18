import React from 'react';
import { Container, Typography, Box, Paper, Grid, useTheme, useMediaQuery } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';

const About = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 40, color: '#DEA514' }} />,
      title: 'Accurate Attendance',
      description: 'Streamlined attendance tracking system designed for Salisbury University faculty and students.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#DEA514' }} />,
      title: 'Secure & Reliable',
      description: 'Built with security in mind, ensuring attendance records are accurately maintained and protected.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#DEA514' }} />,
      title: 'Easy to Use',
      description: 'Simple interface for both faculty and students, making attendance management effortless.'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#F5F5DC',
      py: 8,
      px: isMobile ? 2 : 0
    }}>
      <Container maxWidth="lg">
        <Box sx={{ maxWidth: '800px', mx: 'auto', textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              color: '#2C2C2C',
              fontSize: isMobile ? '2rem' : '2.5rem',
              fontWeight: 'bold',
              mb: 3
            }}
          >
            About ZipAttend
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: '#2C2C2C',
              opacity: 0.85,
              fontSize: isMobile ? '1.1rem' : '1.3rem',
              mb: 2
            }}
          >
            Simplifying Attendance Management at Salisbury University
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            ZipAttend is a modern attendance tracking solution designed to streamline the process of recording and managing class attendance for both faculty and students.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  textAlign: 'center',
                  bgcolor: '#FFFFFF',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 2
                  }
                }}
              >
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    color: '#2C2C2C',
                    fontWeight: 'bold'
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: '1rem' }}
                >
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ 
          maxWidth: '800px', 
          mx: 'auto', 
          textAlign: 'center', 
          mt: 8 
        }}>
          <Typography
            variant="body1"
            sx={{
              color: '#2C2C2C',
              opacity: 0.7,
              fontSize: '0.9rem'
            }}
          >
            © 2024 ZipAttend - Salisbury University
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default About;