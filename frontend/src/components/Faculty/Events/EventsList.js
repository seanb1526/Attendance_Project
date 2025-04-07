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
  Checkbox,
  ListItemText,
  OutlinedInput,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';

const EventsList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);
  
  // Add new state variables for data fetching
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]); // Store all events for filtering
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPastEvents, setShowPastEvents] = useState(false);

  // Fetch events and classes on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch events
        const eventsResponse = await axios.get('/api/events/');
        
        // Sort events by date (nearest first)
        const sortedEvents = [...eventsResponse.data].sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
        
        setAllEvents(sortedEvents);
        
        // Fetch classes
        const classesResponse = await axios.get('/api/classes/');
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

  // Filter events based on search query and whether to show past events
  useEffect(() => {
    // Apply date filtering
    const now = new Date();
    // Set time to beginning of the day to include same-day events
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let filteredEvents = allEvents;
    
    // Filter out past events unless showPastEvents is true
    if (!showPastEvents) {
      filteredEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        // Keep events from today or future days
        return eventDate >= today;
      });
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      filteredEvents = filteredEvents.filter(event => 
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setEvents(filteredEvents);
  }, [searchQuery, allEvents, showPastEvents]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleTogglePastEvents = () => {
    setShowPastEvents(!showPastEvents);
  };

  const handleAssignEvent = (event) => {
    setSelectedEvent(event);
    setSelectedClasses([]);
    setAssignDialogOpen(true);
  };

  const handleAssignSubmit = async () => {
    try {
      // Create an array of promises for each class assignment
      const assignmentPromises = selectedClasses.map(classId => 
        axios.post('/api/class-events/', {
          class_instance: classId,
          event: selectedEvent.id
        })
      );
      
      // Wait for all assignments to complete
      await Promise.all(assignmentPromises);
      
      // Refresh the events list to show updated assignments
      const response = await axios.get('/api/events/');
      
      // Sort events by date (nearest first)
      const sortedEvents = [...response.data].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      
      setAllEvents(sortedEvents);
      
      setAssignDialogOpen(false);
      setSelectedClasses([]);
    } catch (err) {
      console.error('Error assigning event:', err);
      // You could add error handling here
    }
  };

  // Handle change for multi-select
  const handleClassSelectionChange = (event) => {
    const { value } = event.target;
    setSelectedClasses(value);
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

  // Helper to check if an event is in the past
  const isEventPast = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Beginning of today
    return new Date(eventDate) < today;
  };

  // Helper to check if an event is today
  const isEventToday = (eventDate) => {
    const today = new Date();
    const eventDay = new Date(eventDate);
    return today.getDate() === eventDay.getDate() && 
           today.getMonth() === eventDay.getMonth() && 
           today.getFullYear() === eventDay.getFullYear();
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

      {/* Search and filter controls */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Search events by name..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#DEA514',
              },
            },
          }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <FormControlLabel
            control={
              <Switch 
                checked={showPastEvents}
                onChange={handleTogglePastEvents}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#DEA514',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#DEA514',
                  },
                }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <HistoryIcon sx={{ mr: 0.5, fontSize: 20 }} />
                <Typography variant="body2">Show Past Events</Typography>
              </Box>
            }
          />
        </Box>
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
                {searchQuery 
                  ? 'No events found matching your search.' 
                  : showPastEvents 
                    ? 'No events found. Create your first event!' 
                    : 'No upcoming events found. Create a new event or enable "Show Past Events" to see your history.'}
              </Typography>
              {!searchQuery && (
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
              )}
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {events.map((event) => {
                const { date, time } = formatDateTime(event.date);
                const eventDate = new Date(event.date);
                const isPast = isEventPast(event.date);
                const isToday = isEventToday(event.date);
                
                return (
                  <Grid item xs={12} md={6} lg={4} key={event.id}>
                    <Paper
                      sx={{
                        p: 3,
                        bgcolor: '#FFFFFF',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderLeft: isPast 
                          ? '4px solid #999' 
                          : isToday 
                            ? '4px solid #4CAF50' // Green for today's events 
                            : '4px solid #DEA514', // Gold for future events
                      }}
                    >
                      {isToday && (
                        <Chip 
                          label="Today" 
                          size="small" 
                          sx={{ 
                            alignSelf: 'flex-start', 
                            mb: 1,
                            bgcolor: '#4CAF50',
                            color: 'white',
                          }} 
                        />
                      )}
                      
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

                      <Box sx={{ display: 'flex', mt: 2, pt: 2, borderTop: '1px solid #eee', justifyContent: 'space-between' }}>
                        <Button
                          size="small"
                          startIcon={<QrCode2Icon />}
                          sx={{ color: '#666' }}
                        >
                          QR Code
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
                            Assign to Classes
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

      {/* Assign to Classes Dialog */}
      <Dialog 
        open={assignDialogOpen} 
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Event to Classes</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Select one or more classes to assign this event to:
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Select Classes</InputLabel>
            <Select
              multiple
              value={selectedClasses}
              onChange={handleClassSelectionChange}
              input={<OutlinedInput label="Select Classes" />}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <em>Select classes</em>;
                }
                return selected.map(id => {
                  const classItem = classes.find(c => c.id === id);
                  return classItem ? classItem.name : '';
                }).join(', ');
              }}
            >
              {classes.map((classItem) => (
                <MenuItem key={classItem.id} value={classItem.id}>
                  <Checkbox checked={selectedClasses.indexOf(classItem.id) > -1} />
                  <ListItemText primary={classItem.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignSubmit} 
            disabled={selectedClasses.length === 0}
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