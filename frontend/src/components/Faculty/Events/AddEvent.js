import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddEvent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Format the date and time for the API
      const dateTime = new Date(`${eventData.date}T${eventData.time}`).toISOString();
      
      // Get faculty ID from local storage or context
      // This is just a placeholder - you need to implement your authentication system
      const facultyId = localStorage.getItem('facultyId');
      const schoolId = localStorage.getItem('schoolId');
      
      const eventPayload = {
        name: eventData.name,
        description: eventData.description,
        date: dateTime,
        location: eventData.location,
        faculty: facultyId,
        school: schoolId,
      };
      
      // Make the API request
      await axios.post('/api/events/', eventPayload);
      
      // Redirect on success
      navigate('/faculty/events');
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setEventData({
      ...eventData,
      [field]: event.target.value
    });
  };

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
        Create New Event
      </Typography>

      <Paper 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          p: 4,
          maxWidth: 800,
          mx: 'auto',
          bgcolor: '#FFFFFF'
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Event Name"
              required
              value={eventData.name}
              onChange={handleChange('name')}
              placeholder="e.g., Guest Speaker: AI Ethics"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              required
              value={eventData.description}
              onChange={handleChange('description')}
              placeholder="Provide details about the event..."
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date"
              required
              type="date"
              value={eventData.date}
              onChange={handleChange('date')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Time"
              required
              type="time"
              value={eventData.time}
              onChange={handleChange('time')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              required
              value={eventData.location}
              onChange={handleChange('location')}
              placeholder="e.g., Lecture Hall A"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'flex-end' 
            }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/faculty/events')}
                fullWidth={isMobile}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth={isMobile}
                disabled={loading}
                sx={{
                  bgcolor: '#DEA514',
                  '&:hover': {
                    bgcolor: '#B88A10',
                  }
                }}
              >
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Error message */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddEvent;
