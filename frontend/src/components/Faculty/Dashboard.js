import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const stats = [
    { 
      title: 'Upcoming Events', 
      value: '3', 
      icon: <EventIcon sx={{ fontSize: 40, color: '#DEA514' }} />,
      action: () => navigate('/faculty/events')
    },
    { 
      title: 'Active Classes', 
      value: '4', 
      icon: <PeopleIcon sx={{ fontSize: 40, color: '#DEA514' }} />,
      action: () => navigate('/faculty/classes')
    },
  ];

  return (
    <Box>
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

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: '#FFFFFF',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={stat.action}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {stat.icon}
                <Typography 
                  variant="h6" 
                  sx={{ ml: 2, color: '#2C2C2C' }}
                >
                  {stat.title}
                </Typography>
              </Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: '#DEA514',
                  fontWeight: 'bold'
                }}
              >
                {stat.value}
              </Typography>
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#2C2C2C' }}>
              Quick Actions
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <Button 
                variant="contained"
                onClick={() => navigate('/faculty/events/add')}
                fullWidth={isMobile}
              >
                Create New Event
              </Button>
              <Button 
                variant="outlined"
                onClick={() => navigate('/faculty/classes/add')}
                fullWidth={isMobile}
              >
                Add New Class
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;