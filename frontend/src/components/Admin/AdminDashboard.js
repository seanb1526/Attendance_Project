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
  Container,
  Button,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from '../../utils/axios';

// Import sub-components for routes
import AdminHome from './AdminHome';
import UniversityManagement from './UniversityManagement';
import FacultyAdminManagement from './FacultyAdminManagement';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Universities', icon: <SchoolIcon />, path: '/admin/universities' },
  { text: 'Faculty Admins', icon: <SupervisorAccountIcon />, path: '/admin/faculty-admins' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
];

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        setLoading(true);
        const adminId = localStorage.getItem('adminId');
        const adminRole = localStorage.getItem('adminRole');
        
        if (!adminId) {
          setError('You are not logged in as an administrator');
          setLoading(false);
          return;
        }
        
        // For demo purposes, simulate a successful API response
        setTimeout(() => {
          setAdminInfo({
            id: adminId,
            name: 'Admin User',
            email: 'admin@example.com',
            role: adminRole || 'master'
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching admin info:', error);
        setError('Failed to load administrator information');
        setLoading(false);
      }
    };
    
    fetchAdminInfo();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    // Clear admin-related data from localStorage
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('userType');
    localStorage.removeItem('authToken');
    
    // Redirect to home page
    navigate('/');
  };

  const drawer = (
    <div>
      <Toolbar sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        py: 2 
      }}>
        <Typography variant="h6" component="div" sx={{ color: '#DEA514', fontWeight: 'bold' }}>
          Admin Panel
        </Typography>
        {adminInfo && (
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            {adminInfo.role === 'master' ? 'Master Admin' : 
             adminInfo.role === 'co' ? 'Co-Administrator' : 'University Admin'}
          </Typography>
        )}
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          // For sub-admins, maybe hide certain menu items based on role
          const isSubAdmin = adminInfo?.role === 'sub';
          const isHidden = isSubAdmin && 
            (item.path === '/admin/universities' || item.path === '/admin/settings');
          
          if (isHidden) return null;
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'rgba(222, 165, 20, 0.08)',
                    borderRight: '3px solid #DEA514',
                    '&:hover': {
                      bgcolor: 'rgba(222, 165, 20, 0.12)',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? '#DEA514' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: location.pathname === item.path ? '#DEA514' : 'inherit',
                      fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress sx={{ color: '#DEA514' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => navigate('/auth/admin')}
            >
              Sign In
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          color: '#2C2C2C',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {location.pathname === '/admin/dashboard' && 'Administration Dashboard'}
            {location.pathname === '/admin/universities' && 'University Management'}
            {location.pathname === '/admin/faculty-admins' && 'Faculty Administrator Management'}
            {location.pathname === '/admin/settings' && 'System Settings'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {adminInfo && (
              <Typography variant="body2" sx={{ mr: 2 }}>
                {adminInfo.name || adminInfo.email}
              </Typography>
            )}
            <IconButton
              aria-label="profile"
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="admin navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
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
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
          pt: { xs: 10, sm: 12 },
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminHome adminInfo={adminInfo} />} />
          <Route path="universities" element={<UniversityManagement adminInfo={adminInfo} />} />
          <Route path="faculty-admins" element={<FacultyAdminManagement adminInfo={adminInfo} />} />
          <Route path="settings" element={
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>System Settings</Typography>
              <Typography variant="body1" color="text.secondary">
                System settings will be implemented in a future update.
              </Typography>
            </Paper>
          } />
        </Routes>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
