import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Home = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to ClassAttend
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          Your attendance management solution
        </Typography>
      </Box>
    </Container>
  );
};

export default Home; 