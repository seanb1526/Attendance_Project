import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Container
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import AddBoxIcon from '@mui/icons-material/AddBox';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import LogoutIcon from '@mui/icons-material/Logout';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from '../../utils/axios';  // Adjust the path as needed

// Import sub-components (we'll create these next)
import Dashboard from './Dashboard';
import EventsList from './Events/EventsList';
import AddEvent from './Events/AddEvent';
import ClassesList from './Classes/ClassesList';
import AddClass from './Classes/AddClass';
import ClassDetails from './Classes/ClassDetails';
import EditClass from './Classes/EditClass';
import EditEvent from './Events/EditEvent';
import FacultyProfileModal from './FacultyProfileModal';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/faculty/dashboard' },
  { text: 'Events', icon: <EventIcon />, path: '/faculty/events' },
  { text: 'Add Event', icon: <AddBoxIcon />, path: '/faculty/events/add' },
  { text: 'Classes', icon: <ClassIcon />, path: '/faculty/classes' },
  { text: 'Add Class', icon: <SchoolIcon />, path: '/faculty/classes/add' },
];

const FacultyDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [facultyName, setFacultyName] = useState('Professor');
  const [schoolName, setSchoolName] = useState('');  // Add state for school name
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const facultyId = localStorage.getItem('facultyId');
        const schoolId = localStorage.getItem('schoolId');
        
        if (facultyId) {
          const response = await axios.get(`/api/facultys/${facultyId}/`);
          setFacultyName(response.data.last_name || 'Professor');
          
          // If we have a school ID, fetch the school name
          if (schoolId) {
            try {
              const schoolResponse = await axios.get(`/api/schools/${schoolId}/`);
              setSchoolName(schoolResponse.data.name);
            } catch (schoolErr) {
              console.error('Error fetching school data:', schoolErr);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching faculty data:', err);
      }
    };
    
    fetchFacultyData();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenProfileModal = () => {
    setProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setProfileModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('facultyId');
    localStorage.removeItem('schoolId');
    
    navigate('/');
  };

  const drawer = (
    <Box sx={{ bgcolor: '#FFFFFF', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        sx={{
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 2
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              color: '#2C2C2C',
              fontWeight: 'bold',
              lineHeight: 1.2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8
              }
            }}
            onClick={() => navigate('/')}
          >
            <span style={{ color: '#DEA514' }}>TrueAttend</span>
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) handleDrawerToggle();
              }}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'rgba(222, 165, 20, 0.08)',
                  borderRight: 3,
                  borderColor: '#DEA514',
                  '&:hover': {
                    bgcolor: 'rgba(222, 165, 20, 0.12)',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(222, 165, 20, 0.04)',
                },
              }}
            >
              <ListItemIcon sx={{
                color: location.pathname === item.path ? '#DEA514' : 'inherit'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  color: location.pathname === item.path ? '#DEA514' : '#2C2C2C',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ mt: 'auto' }}>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                handleLogout();
                if (isMobile) handleDrawerToggle();
              }}
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(222, 165, 20, 0.04)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#f44336' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                sx={{
                  color: '#f44336',
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar sx={{ minHeight: '64px' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: '#DEA514'
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h5" 
              noWrap 
              component="div" 
              sx={{ 
                color: '#2C2C2C',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              Faculty Portal {schoolName && `- ${schoolName}`}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2,
            borderLeft: '1px solid rgba(0,0,0,0.08)',
            pl: 2,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8
            }
          }}
          onClick={handleOpenProfileModal}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#666',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Welcome, {facultyName}
            </Typography>
            <Box 
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%',
                bgcolor: '#DEA514',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 'bold'
              }}
            >
              {facultyName.charAt(0)}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#F5F5DC',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <Routes>
            <Route index element={<Navigate to="/faculty/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="events" element={<EventsList />} />
            <Route path="events/add" element={<AddEvent />} />
            <Route path="events/:id/edit" element={<EditEvent />} />
            <Route path="classes" element={<ClassesList />} />
            <Route path="classes/add" element={<AddClass />} />
            <Route path="classes/:id" element={<ClassDetails />} />
            <Route path="classes/:id/edit" element={<EditClass />} />
          </Routes>
        </Container>
      </Box>

      <FacultyProfileModal open={profileModalOpen} onClose={handleCloseProfileModal} />
    </Box>
  );
};

export default FacultyDashboard;
