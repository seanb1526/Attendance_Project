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
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import { getApiUrl } from '../../../utils/urlHelper';

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
        // Get school ID from localStorage
        const schoolId = localStorage.getItem('schoolId');
        
        if (!schoolId) {
          throw new Error('School ID not found. You may need to log in again.');
        }
        
        // Fetch events with school filter
        const eventsResponse = await axios.get(`/api/events/?school=${schoolId}`);
        
        // Sort events by date (nearest first)
        const sortedEvents = [...eventsResponse.data].sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
        
        setAllEvents(sortedEvents);
        
        // Fetch classes for this school
        const classesResponse = await axios.get(`/api/classes/?school=${schoolId}`);
        setClasses(classesResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.message && err.message.includes('School ID not found')) {
          setError('School information not available. Please log out and log in again.');
        } else {
          setError('Failed to load data. Please try again.');
        }
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
    
    // Get school ID and faculty ID from localStorage
    const schoolId = localStorage.getItem('schoolId');
    const facultyId = localStorage.getItem('facultyId');
    
    // First filter by school ID to ensure we only show events from this school
    let filteredEvents = allEvents;
    
    if (schoolId) {
      // Use string comparison to handle potential type differences
      filteredEvents = allEvents.filter(event => 
        String(event.school) === String(schoolId)
      );
    }
    
    // Then filter by date if not showing past events
    if (!showPastEvents) {
      filteredEvents = filteredEvents.filter(event => {
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
    
    // Separate events into two groups: faculty events and other events
    let facultyEvents = [];
    let otherEvents = [];
    
    filteredEvents.forEach(event => {
      if (String(event.faculty) === String(facultyId)) {
        facultyEvents.push(event);
      } else {
        otherEvents.push(event);
      }
    });
    
    // Sort each group by nearest date
    facultyEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    otherEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Combine the sorted groups
    setEvents([...facultyEvents, ...otherEvents]);
    
    // Store information about whether an event is a faculty event
    // We'll use this to render the divider later
    if (facultyEvents.length > 0 && otherEvents.length > 0) {
      // Store the index of the first non-faculty event
      sessionStorage.setItem('dividerIndex', facultyEvents.length);
    } else {
      sessionStorage.removeItem('dividerIndex');
    }
    
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
      
      // Get school ID for refreshing events
      const schoolId = localStorage.getItem('schoolId');
      
      // Refresh the events list to show updated assignments
      const response = await axios.get(`/api/events/?school=${schoolId}`);
      
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

  const handleDownloadQrCode = (eventId) => {
    // Use the dynamic API URL helper instead of hardcoded URL
    window.open(getApiUrl(`/api/event/${eventId}/qr/`), '_blank');
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
              {events.map((event, index) => {
                const { date, time } = formatDateTime(event.date);
                const endTime = event.end_time ? formatDateTime(event.end_time).time : null;
                const eventDate = new Date(event.date);
                const isPast = isEventPast(event.date);
                const isToday = isEventToday(event.date);
                const dividerIndex = parseInt(sessionStorage.getItem('dividerIndex'));
                const showDivider = !isNaN(dividerIndex) && index === dividerIndex;
                
                return (
                  <React.Fragment key={event.id}>
                    {showDivider && (
                      <Grid item xs={12}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          width: '100%', 
                          my: 2 
                        }}>
                          <Divider sx={{ flexGrow: 1 }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              px: 2, 
                              color: 'text.secondary',
                              fontWeight: 'medium',
                              bgcolor: 'background.paper',
                              borderRadius: 1,
                              py: 0.5
                            }}
                          >
                            Other Faculty Events
                          </Typography>
                          <Divider sx={{ flexGrow: 1 }} />
                        </Box>
                      </Grid>
                    )}
                    
                    <Grid item xs={12} md={6} lg={4}>
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
                              ? '4px solid #4CAF50' 
                              : canEditEvent(event) 
                                ? '4px solid #DEA514' 
                                : '4px solid #90caf9', // Different color for others' events
                        }}
                      >
                        <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
                          {isToday && (
                            <Chip 
                              label="Today" 
                              size="small" 
                              sx={{ 
                                mb: 1,
                                bgcolor: '#4CAF50',
                                color: 'white',
                              }} 
                            />
                          )}
                          
                          {canEditEvent(event) && (
                            <Chip 
                              label="Your Event" 
                              size="small" 
                              sx={{ 
                                mb: 1,
                                bgcolor: '#DEA514',
                                color: 'white',
                              }} 
                            />
                          )}
                        </Box>
                        
                        <Typography variant="h6" sx={{ mb: 2, color: '#2C2C2C' }}>
                          {event.name}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CalendarTodayIcon sx={{ fontSize: 20, mr: 1, color: '#666' }} />
                            <Typography variant="body2" color="text.secondary">
                              {date}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AccessTimeIcon sx={{ fontSize: 20, mr: 1, color: '#666' }} />
                            <Typography variant="body2" color="text.secondary">
                              {time}{endTime ? ` - ${endTime}` : ''}
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
                            onClick={() => handleDownloadQrCode(event.id)}
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
                  </React.Fragment>
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