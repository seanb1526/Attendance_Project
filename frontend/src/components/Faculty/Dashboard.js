import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import ClassIcon from '@mui/icons-material/Class';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

// Mock data - replace with real data later
const mockUpcomingEvents = [
  {
    id: 1,
    name: 'Guest Speaker: AI Ethics',
    date: '2024-03-15',
    time: '14:00',
    location: 'Lecture Hall A',
  },
  {
    id: 2,
    name: 'Programming Workshop',
    date: '2024-03-22',
    time: '15:30',
    location: 'Computer Lab 2',
  },
];

const mockClasses = [
  {
    id: 1,
    name: 'Introduction to Computer Science',
    code: 'CS101-A',
    students: 45,
  },
  {
    id: 2,
    name: 'Data Structures',
    code: 'CS201-B',
    students: 38,
  },
];

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  return (
    <Box>
      {/* Welcome Section */}
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4,
          color: '#2C2C2C',
          fontWeight: 'bold'
        }}
      >
        Welcome Back, Professor
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#FFFFFF',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
            onClick={() => navigate('/faculty/classes')}
          >
            <ClassIcon sx={{ fontSize: 40, color: '#DEA514', mr: 2 }} />
            <Box>
              <Typography variant="h6" color="text.secondary">
                Active Classes
              </Typography>
              <Typography variant="h4" sx={{ color: '#2C2C2C', fontWeight: 'bold' }}>
                {mockClasses.length}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#FFFFFF',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
            onClick={() => navigate('/faculty/events')}
          >
            <EventIcon sx={{ fontSize: 40, color: '#DEA514', mr: 2 }} />
            <Box>
              <Typography variant="h6" color="text.secondary">
                Upcoming Events
              </Typography>
              <Typography variant="h4" sx={{ color: '#2C2C2C', fontWeight: 'bold' }}>
                {mockUpcomingEvents.length}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#2C2C2C' }}>
                Upcoming Events
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate('/faculty/events/add')}
                sx={{
                  borderColor: '#DEA514',
                  color: '#DEA514',
                  '&:hover': {
                    borderColor: '#B88A10',
                    color: '#B88A10',
                  }
                }}
              >
                Add Event
              </Button>
            </Box>
            <List>
              {mockUpcomingEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <ListItem>
                    <ListItemIcon>
                      <EventIcon sx={{ color: '#DEA514' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={event.name}
                      secondary={`${event.date} at ${event.time} - ${event.location}`}
                    />
                  </ListItem>
                  {index < mockUpcomingEvents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Active Classes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#2C2C2C' }}>
                Active Classes
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate('/faculty/classes/add')}
                sx={{
                  borderColor: '#DEA514',
                  color: '#DEA514',
                  '&:hover': {
                    borderColor: '#B88A10',
                    color: '#B88A10',
                  }
                }}
              >
                Add Class
              </Button>
            </Box>
            <List>
              {mockClasses.map((classItem, index) => (
                <React.Fragment key={classItem.id}>
                  <ListItem>
                    <ListItemIcon>
                      <ClassIcon sx={{ color: '#DEA514' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={classItem.name}
                      secondary={`${classItem.code} - ${classItem.students} students`}
                    />
                  </ListItem>
                  {index < mockClasses.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;