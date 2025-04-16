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
  DialogContentText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import { getApiUrl } from '../../../utils/urlHelper';
import { canEditEvent } from '../../../utils/adminUtils';

const EventsList = ({ adminStatus }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [eventPermissions, setEventPermissions] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPastEvents, setShowPastEvents] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const schoolId = localStorage.getItem('schoolId');
        const facultyId = localStorage.getItem('facultyId');
        
        if (!schoolId) {
          throw new Error('School ID not found. You may need to log in again.');
        }
        
        const eventsResponse = await axios.get(`/api/events/?school=${schoolId}`);
        const sortedEvents = [...eventsResponse.data].sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
        
        setAllEvents(sortedEvents);
        
        const classesResponse = await axios.get(`/api/classes/?school=${schoolId}&faculty=${facultyId}`);
        setClasses(classesResponse.data);

        if (adminStatus?.isAdmin) {
          const permissions = {};
          for (const event of sortedEvents) {
            permissions[event.id] = await canEditEvent(
              event.school,
              facultyId,
              event.faculty,
              adminStatus
            );
          }
          setEventPermissions(permissions);
        }
        
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
  }, [adminStatus]);

  useEffect(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const schoolId = localStorage.getItem('schoolId');
    const facultyId = localStorage.getItem('facultyId');
    
    let filteredEvents = allEvents;
    
    if (schoolId) {
      filteredEvents = allEvents.filter(event => 
        String(event.school) === String(schoolId)
      );
    }
    
    if (!showPastEvents) {
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today;
      });
    }
    
    if (searchQuery.trim() !== '') {
      filteredEvents = filteredEvents.filter(event => 
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    let facultyEvents = [];
    let otherEvents = [];
    
    filteredEvents.forEach(event => {
      if (String(event.faculty) === String(facultyId)) {
        facultyEvents.push(event);
      } else {
        otherEvents.push(event);
      }
    });
    
    facultyEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    otherEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    setEvents([...facultyEvents, ...otherEvents]);
    
    if (facultyEvents.length > 0 && otherEvents.length > 0) {
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
      const assignmentPromises = selectedClasses.map(classId => 
        axios.post('/api/class-events/', {
          class_instance: classId,
          event: selectedEvent.id
        })
      );
      
      await Promise.all(assignmentPromises);
      
      const schoolId = localStorage.getItem('schoolId');
      
      const response = await axios.get(`/api/events/?school=${schoolId}`);
      const sortedEvents = [...response.data].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      
      setAllEvents(sortedEvents);
      
      setAssignDialogOpen(false);
      setSelectedClasses([]);
    } catch (err) {
      console.error('Error assigning event:', err);
    }
  };

  const handleClassSelectionChange = (event) => {
    const { value } = event.target;
    setSelectedClasses(value);
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return { date: 'TBD', time: 'TBD' };
    
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const canManageEvent = (event) => {
    const facultyId = localStorage.getItem('facultyId');
    
    if (event.faculty === facultyId) {
      return true;
    }
    
    if (adminStatus?.isAdmin && adminStatus.adminRole === 'sub') {
      return eventPermissions[event.id];
    }
    
    return false;
  };

  const isEventPast = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(eventDate) < today;
  };

  const isEventToday = (eventDate) => {
    const today = new Date();
    const eventDay = new Date(eventDate);
    return today.getDate() === eventDay.getDate() && 
           today.getMonth() === eventDay.getMonth() && 
           today.getFullYear() === eventDay.getFullYear();
  };

  const handleDownloadQrCode = (eventId) => {
    window.open(`${getApiUrl(`/api/events/${eventId}/generate-qr/`)}`, '_blank');
  };

  const handleOpenDeleteDialog = (event, e) => {
    if (e) {
      e.stopPropagation();
    }
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    setLoading(true);
    try {
      const facultyId = localStorage.getItem('facultyId');
      
      await axios.delete(`/api/events/${eventToDelete.id}/`, {
        params: { faculty_id: facultyId }
      });
      
      setAllEvents(prev => prev.filter(event => event.id !== eventToDelete.id));
      
      setError(null);
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete the event. Please try again.');
    } finally {
      setLoading(false);
    }
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

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress sx={{ color: '#DEA514' }} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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
                              : canManageEvent(event) 
                                ? '4px solid #DEA514' 
                                : '4px solid #90caf9',
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
                          
                          {event.faculty === localStorage.getItem('facultyId') ? (
                            <Chip 
                              label="Your Event" 
                              size="small" 
                              sx={{ 
                                mb: 1,
                                bgcolor: '#DEA514',
                                color: 'white',
                              }} 
                            />
                          ) : canManageEvent(event) ? (
                            <Chip 
                              label="Admin Access" 
                              size="small" 
                              sx={{ 
                                mb: 1,
                                bgcolor: '#4a148c',
                                color: 'white',
                              }} 
                            />
                          ) : null}
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

                        <Box sx={{ 
                          display: 'flex', 
                          mt: 'auto', 
                          pt: 2, 
                          borderTop: '1px solid #eee', 
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Button
                            size="small"
                            startIcon={<QrCode2Icon />}
                            sx={{ 
                              color: '#666',
                              '&:hover': {
                                backgroundColor: 'rgba(102, 102, 102, 0.04)'
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadQrCode(event.id);
                            }}
                          >
                            QR Code
                          </Button>
                          
                          {canManageEvent(event) && (
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 1,
                              justifyContent: 'flex-end' 
                            }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/faculty/events/${event.id}/edit`);
                                }}
                                sx={{
                                  borderColor: '#DEA514',
                                  color: '#DEA514',
                                  '&:hover': {
                                    borderColor: '#B88A10',
                                    color: '#B88A10',
                                    bgcolor: 'rgba(222, 165, 20, 0.04)',
                                  },
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDeleteDialog(event, e);
                                }}
                                sx={{
                                  '&:hover': {
                                    bgcolor: 'rgba(211, 47, 47, 0.04)',
                                  },
                                }}
                              >
                                Delete
                              </Button>
                            </Box>
                          )}
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
            ></Select>
              {classes.map((classItem) => (
                <MenuItem key={classItem.id} value={classItem.id}>
                  <Checkbox checked={selectedClasses.indexOf(classItem.id) > -1} />
                  <ListItemText primary={classItem.name} />
                </MenuItem>
              ))}
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

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Event
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the event "{eventToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteEvent} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventsList;