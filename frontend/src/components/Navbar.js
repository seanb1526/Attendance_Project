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
  ListItemText
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

  const handleSignInClick = () => {
    if (isAuthenticated) {
      if (userType === 'faculty') {
        navigate('/faculty/dashboard');
      } else if (userType === 'student') {
        navigate('/student/dashboard');
      }
    } else {
      navigate('/auth');
    }
  };

  const menuItems = [
    { text: 'About', path: '/about' },
    { 
      text: isAuthenticated ? 'Go to Dashboard' : 'Sign In / Register', 
      path: isAuthenticated 
        ? (userType === 'faculty' ? '/faculty/dashboard' : '/student/dashboard') 
        : '/auth'
    }
  ];

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text} 
            component={RouterLink} 
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{
              color: '#2C2C2C',
              '&:hover': {
                backgroundColor: 'rgba(222, 165, 20, 0.08)',
              }
            }}
          >
            <ListItemText 
              primary={item.text}
              sx={{
                color: item.text === 'Sign In / Register' || item.text === 'Go to Dashboard' 
                  ? '#DEA514' : 'inherit',
                fontWeight: item.text === 'Sign In / Register' || item.text === 'Go to Dashboard' 
                  ? 'bold' : 'normal',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position="fixed">
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
          <Box>
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
            {!isStudentDashboard && (
              <Button 
                variant="contained"
                onClick={handleSignInClick}
                sx={{ 
                  ml: 2,
                  bgcolor: '#DEA514',
                  '&:hover': {
                    bgcolor: '#B88A10',
                  }
                }}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Sign In / Register'}
              </Button>
            )}
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