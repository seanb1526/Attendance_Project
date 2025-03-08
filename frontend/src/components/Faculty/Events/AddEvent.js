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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AddEvent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Just log the data and navigate back for now
    console.log('Creating event:', eventData);
    navigate('/faculty/events');
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
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth={isMobile}
                sx={{
                  bgcolor: '#DEA514',
                  '&:hover': {
                    bgcolor: '#B88A10',
                  }
                }}
              >
                Create Event
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AddEvent;
