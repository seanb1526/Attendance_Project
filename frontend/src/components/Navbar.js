import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  useTheme, 
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  
  // Check if we're on the student dashboard
  const isStudentDashboard = location.pathname === '/student/dashboard';

  // Check authentication status on component mount and location change
  useEffect(() => {
    const facultyId = localStorage.getItem('facultyId');
    const studentId = localStorage.getItem('studentId');
    
    if (facultyId) {
      setIsAuthenticated(true);
      setUserType('faculty');
    } else if (studentId) {
      setIsAuthenticated(true);
      setUserType('student');
    } else {
      setIsAuthenticated(false);
      setUserType(null);
    }
  }, [location]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleStudentClick = () => {
    if (isAuthenticated && userType === 'student') {
      navigate('/student/dashboard');
    } else {
      navigate('/auth/student');
    }
  };

  const handleFacultyClick = () => {
    if (isAuthenticated && userType === 'faculty') {
      navigate('/faculty/dashboard');
    } else {
      navigate('/auth/faculty');
    }
  };

  const menuItems = [
    { text: 'About', path: '/about' },
    // Remove the old combined sign-in menu item
  ];

  // Define the drawer component
  const drawer = (
    <Box sx={{ width: 250, p: 2 }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/about">
            <ListItemText primary="About" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton onClick={handleStudentClick}>
            <ListItemText 
              primary={(isAuthenticated && userType === 'student') ? 'Student Dashboard' : 'Students'} 
              primaryTypographyProps={{
                color: (isAuthenticated && userType === 'student') ? '#DEA514' : 'inherit',
                fontWeight: (isAuthenticated && userType === 'student') ? 'bold' : 'normal',
              }}
            />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton onClick={handleFacultyClick}>
            <ListItemText 
              primary={(isAuthenticated && userType === 'faculty') ? 'Faculty Dashboard' : 'Faculty'} 
              primaryTypographyProps={{
                color: (isAuthenticated && userType === 'faculty') ? '#DEA514' : 'inherit',
                fontWeight: (isAuthenticated && userType === 'faculty') ? 'bold' : 'normal',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: 'white', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            textDecoration: 'none', 
            color: '#DEA514',
            fontWeight: 'bold',
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            '&:hover': {
              color: '#B88A10',
            }
          }}
        >
          TrueAttend
        </Typography>

        {isMobile ? (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ color: '#DEA514' }}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              component={RouterLink} 
              to="/about"
              sx={{ 
                color: '#2C2C2C',
                '&:hover': {
                  color: '#DEA514',
                }
              }}
            >
              About
            </Button>
            
            <Button 
              onClick={handleStudentClick}
              sx={{ 
                ml: 2,
                color: (isAuthenticated && userType === 'student') ? '#FFFFFF' : '#DEA514',
                bgcolor: (isAuthenticated && userType === 'student') ? '#DEA514' : 'transparent',
                border: '1px solid #DEA514',
                '&:hover': {
                  bgcolor: (isAuthenticated && userType === 'student') ? '#B88A10' : 'rgba(222, 165, 20, 0.04)',
                  color: (isAuthenticated && userType === 'student') ? '#FFFFFF' : '#B88A10',
                }
              }}
            >
              {(isAuthenticated && userType === 'student') ? 'Student Dashboard' : 'Students'}
            </Button>
            
            <Button 
              onClick={handleFacultyClick}
              sx={{ 
                ml: 2,
                color: (isAuthenticated && userType === 'faculty') ? '#FFFFFF' : '#DEA514',
                bgcolor: (isAuthenticated && userType === 'faculty') ? '#DEA514' : 'transparent',
                border: '1px solid #DEA514',
                '&:hover': {
                  bgcolor: (isAuthenticated && userType === 'faculty') ? '#B88A10' : 'rgba(222, 165, 20, 0.04)',
                  color: (isAuthenticated && userType === 'faculty') ? '#FFFFFF' : '#B88A10',
                }
              }}
            >
              {(isAuthenticated && userType === 'faculty') ? 'Faculty Dashboard' : 'Faculty'}
            </Button>
          </Box>
        )}

        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 250,
              backgroundColor: '#FFFFFF',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;