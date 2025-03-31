import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Make sure to import axios

const EventsList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  
  // Add new state variables for data fetching
  const [events, setEvents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events and classes on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch events
        const eventsResponse = await axios.get('/api/events/');
        
        // Fetch classes
        const classesResponse = await axios.get('/api/classes/');
        
        setEvents(eventsResponse.data);
        setClasses(classesResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleAssignEvent = (event) => {
    setSelectedEvent(event);
    setAssignDialogOpen(true);
  };

  const handleAssignSubmit = async () => {
    try {
      // Make API call to assign the event to the class
      await axios.post('/api/class-events/', {
        class_instance: selectedClass,
        event: selectedEvent.id
      });
      
      // Refresh the events list to show updated assignments
      const response = await axios.get('/api/events/');
      setEvents(response.data);
      
      setAssignDialogOpen(false);
      setSelectedClass('');
    } catch (err) {
      console.error('Error assigning event:', err);
      // You could add error handling here
    }
  };

  // Helper function to format date and time
  const formatDateTime = (isoString) => {
    if (!isoString) return { date: 'TBD', time: 'TBD' };
    
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Inside the component, add a helper function to check if the faculty created the event
  const canEditEvent = (event) => {
    const facultyId = localStorage.getItem('facultyId');
    return event.faculty === facultyId;
  };

  const handleDownloadQrCode = (eventId) => {
    // Use the full backend URL
    window.open(`http://localhost:8000/api/event/${eventId}/qr/`, '_blank');
  };

  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#2C2C2C',
            fontWeight: 'bold'
          }}
        >
          Events
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/faculty/events/add')}
          sx={{
            bgcolor: '#DEA514',
            '&:hover': {
              bgcolor: '#B88A10',
            }
          }}
        >
          Create New Event
        </Button>
      </Box>

      {/* Display loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress sx={{ color: '#DEA514' }} />
        </Box>
      )}

      {/* Display error message if any */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Display events */}
      {!loading && !error && (
        <>
          {events.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No events found. Create your first event!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/faculty/events/add')}
                sx={{
                  mt: 2,
                  bgcolor: '#DEA514',
                  '&:hover': {
                    bgcolor: '#B88A10',
                  }
                }}
              >
                Create New Event
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {events.map((event) => {
                const { date, time } = formatDateTime(event.date);
                return (
                  <Grid item xs={12} md={6} lg={4} key={event.id}>
                    <Paper
                      sx={{
                        p: 3,
                        bgcolor: '#FFFFFF',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2, color: '#2C2C2C' }}>
                        {event.name}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarTodayIcon sx={{ fontSize: 20, mr: 1, color: '#666' }} />
                          <Typography variant="body2" color="text.secondary">
                            {date} at {time}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOnIcon sx={{ fontSize: 20, mr: 1, color: '#666' }} />
                          <Typography variant="body2" color="text.secondary">
                            {event.location || 'No location specified'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Check-in Window: {event.checkin_before_minutes > 0 ? `${event.checkin_before_minutes} min before` : 'Starts at event time'} 
                          {' to '}
                          {event.checkin_after_minutes > 0 ? `${event.checkin_after_minutes} min after` : 'event time only'}
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                        {event.description || 'No description available'}
                      </Typography>

                      {/* We'll need to implement class assignment logic here */}
                      {/* This is placeholder for now */}
                      <Box sx={{ mt: 'auto', pt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                          Assigned Classes:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {/* Replace with real assigned classes when we have them */}
                          {/* Add logic to display assigned classes here */}
                          <Chip label="Not implemented yet" size="small" />
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', mt: 2, pt: 2, borderTop: '1px solid #eee', justifyContent: 'space-between' }}>
                        <Button
                          size="small"
                          startIcon={<QrCode2Icon />}
                          onClick={() => handleDownloadQrCode(event.id)}
                          sx={{ color: '#666', mr: 1 }}
                        >
                          Download QR Code
                        </Button>
                        
                        <Box>
                          {/* Only show edit button if the faculty created this event */}
                          {canEditEvent(event) && (
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => navigate(`/faculty/events/${event.id}/edit`)}
                              sx={{ color: '#666', mr: 1 }}
                            >
                              Edit
                            </Button>
                          )}
                          
                          <Button
                            size="small"
                            onClick={() => handleAssignEvent(event)}
                            sx={{ color: '#DEA514' }}
                          >
                            Assign to Class
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}

      {/* Assign to Class Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
        <DialogTitle>Assign Event to Class</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Class</InputLabel>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              label="Select Class"
            >
              {classes.map((classItem) => (
                <MenuItem key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignSubmit} 
            disabled={!selectedClass}
            sx={{ color: '#DEA514' }}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventsList;
