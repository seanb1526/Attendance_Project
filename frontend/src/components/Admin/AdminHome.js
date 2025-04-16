import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import axios from '../../utils/axios';

const AdminHome = ({ adminInfo }) => {
  const [stats, setStats] = useState({
    universities: 0,
    faculty: 0,
    students: 0,
    events: 0,
    admins: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // For now, just simulate some data instead of making actual API calls
    // Replace with actual API calls when available
    setTimeout(() => {
      setStats({
        universities: 5,
        faculty: 124,
        students: 3452,
        events: 87,
        admins: 8,
      });
      
      setRecentActivity([
        { id: 1, type: 'faculty_added', name: 'Dr. Jane Smith', university: 'Salisbury University', timestamp: '2023-03-15T14:32:00Z' },
        { id: 2, type: 'admin_assigned', name: 'Prof. Michael Johnson', university: 'University of Maryland', timestamp: '2023-03-14T11:20:00Z' },
        { id: 3, type: 'event_created', name: 'Spring Lecture Series', university: 'Salisbury University', timestamp: '2023-03-13T16:45:00Z' },
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: '#DEA514' }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#2C2C2C' }}>
        Welcome, {adminInfo?.name || 'Administrator'}
      </Typography>
      
      {adminInfo?.role === 'master' && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You are logged in as a Master Administrator with full system access.
        </Typography>
      )}
      
      {adminInfo?.role === 'co' && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You are logged in as a Co-Administrator with system-wide management capabilities.
        </Typography>
      )}
      
      {adminInfo?.role === 'sub' && adminInfo?.university && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You are logged in as an Administrator for {adminInfo.university}.
        </Typography>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center',
              bgcolor: '#FFFFFF',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              },
            }}
          >
            <Avatar sx={{ bgcolor: '#DEA514', mr: 2 }}>
              <SchoolIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Universities
              </Typography>
              <Typography variant="h4">
                {stats.universities}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center',
              bgcolor: '#FFFFFF',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              },
            }}
          >
            <Avatar sx={{ bgcolor: '#4CAF50', mr: 2 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Faculty
              </Typography>
              <Typography variant="h4">
                {stats.faculty}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center',
              bgcolor: '#FFFFFF',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              },
            }}
          >
            <Avatar sx={{ bgcolor: '#2196F3', mr: 2 }}>
              <EventIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Events
              </Typography>
              <Typography variant="h4">
                {stats.events}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {(adminInfo?.role === 'master' || adminInfo?.role === 'co') && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper 
              sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center',
                bgcolor: '#FFFFFF',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <Avatar sx={{ bgcolor: '#9C27B0', mr: 2 }}>
                <SupervisorAccountIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Administrators
                </Typography>
                <Typography variant="h4">
                  {stats.admins}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Recent Activity */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Recent Activity" />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          <List>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 
                        activity.type === 'faculty_added' ? '#4CAF50' : 
                        activity.type === 'admin_assigned' ? '#9C27B0' : 
                        '#2196F3' 
                      }}>
                        {activity.type === 'faculty_added' ? <PersonIcon /> : 
                         activity.type === 'admin_assigned' ? <SupervisorAccountIcon /> : 
                         <EventIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        activity.type === 'faculty_added' ? `Faculty Member Added: ${activity.name}` :
                        activity.type === 'admin_assigned' ? `Administrator Assigned: ${activity.name}` :
                        `Event Created: ${activity.name}`
                      }
                      secondary={`${activity.university} - ${formatDate(activity.timestamp)}`}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary="No recent activity"
                  secondary="New activities will appear here"
                />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminHome;
