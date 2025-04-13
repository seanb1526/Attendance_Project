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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';

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
    time: '',      // Keep this for backwards compatibility
    endTime: '',   // Add new endTime field
    location: '',
    checkin_before_minutes: 15,
    checkin_after_minutes: 15,
  });

  // Generate 15-minute interval options from 0 to 120 minutes (2 hours)
  const timeIntervalOptions = [];
  for (let minutes = 0; minutes <= 120; minutes += 15) {
    timeIntervalOptions.push(minutes);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Format the date and time for the API
      const dateTime = new Date(`${eventData.date}T${eventData.time}`).toISOString();
      
      // Format end time if provided
      let endDateTime = null;
      if (eventData.endTime && eventData.endTime.trim() !== '') {
        endDateTime = new Date(`${eventData.date}T${eventData.endTime}`).toISOString();
      }
      
      // Get faculty ID from local storage or context
      const facultyId = localStorage.getItem('facultyId');
      const schoolId = localStorage.getItem('schoolId');
      
      const eventPayload = {
        name: eventData.name,
        description: eventData.description,
        date: dateTime,
        end_time: endDateTime,  // Ensure this is included in the payload
        location: eventData.location,
        faculty: facultyId,
        school: schoolId,
        checkin_before_minutes: eventData.checkin_before_minutes,
        checkin_after_minutes: eventData.checkin_after_minutes,
      };
      
      console.log('Submitting event with payload:', eventPayload); // Debug log
      
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
              value={eventData.description}
              onChange={handleChange('description')}
              placeholder="Provide details about the event"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              required
              InputLabelProps={{ shrink: true }}
              value={eventData.date}
              onChange={handleChange('date')}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Time"
              type="time"
              required
              InputLabelProps={{ shrink: true }}
              value={eventData.time}
              onChange={handleChange('time')}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="End Time"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={eventData.endTime}
              onChange={handleChange('endTime')}
              placeholder="Optional"
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
          
          {/* Check-in time window options */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2, mb: 2, fontSize: '1rem' }}>
              Attendance Check-in Window
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Allow Check-in Before</InputLabel>
              <Select
                value={eventData.checkin_before_minutes}
                onChange={handleChange('checkin_before_minutes')}
                label="Allow Check-in Before"
              >
                {timeIntervalOptions.map((minutes) => (
                  <MenuItem key={`before-${minutes}`} value={minutes}>
                    {minutes === 0 ? 'Not allowed' : `${minutes} minutes before`}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                How long before the event can students check in?
              </FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Allow Check-in After</InputLabel>
              <Select
                value={eventData.checkin_after_minutes}
                onChange={handleChange('checkin_after_minutes')}
                label="Allow Check-in After"
              >
                {timeIntervalOptions.map((minutes) => (
                  <MenuItem key={`after-${minutes}`} value={minutes}>
                    {minutes === 0 ? 'Not allowed' : `${minutes} minutes after`}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                How long after the event starts can students still check in?
              </FormHelperText>
            </FormControl>
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
