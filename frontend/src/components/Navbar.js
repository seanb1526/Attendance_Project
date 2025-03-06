import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: '#DEA514', // New Saffron
            fontWeight: 'bold',
            fontSize: '1.5rem',
            '&:hover': {
              color: '#B88A10', // Darker Saffron
            }
          }}
        >
          TrueAttend
        </Typography>
        <Box>
          <Button 
            component={RouterLink} 
            to="/about"
            sx={{ 
              color: '#2C2C2C',
              '&:hover': {
                color: '#DEA514', // New Saffron
              }
            }}
          >
            About
          </Button>
          <Button 
            variant="contained"
            component={RouterLink} 
            to="/auth"
            sx={{ 
              ml: 2,
              bgcolor: '#DEA514', // New Saffron
              '&:hover': {
                bgcolor: '#B88A10', // Darker Saffron
              }
            }}
          >
            Sign In / Register
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 