import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Avatar,
  ListItemAvatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText as MuiListItemText,
  OutlinedInput,
  FormHelperText,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import { getApiUrl } from '../../../utils/urlHelper';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import LinkOffIcon from '@mui/icons-material/LinkOff';

const ClassDetails = () => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendanceLoading, setAttendanceLoading] = useState({});
  const hasLoadedRef = React.useRef(false);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState('');

  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [eventToUnassign, setEventToUnassign] = useState(null);
  const [unassignLoading, setUnassignLoading] = useState(false);

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (hasLoadedRef.current) return;
      hasLoadedRef.current = true;

      try {
        setLoading(true);

        const classResponse = await axios.get(`/api/classes/${id}/`);
        setClassData(classResponse.data);

        try {
          const eventsResponse = await axios.get(`/api/class-events/?class_instance=${id}`);
          if (eventsResponse.data && eventsResponse.data.length > 0) {
            const eventPromises = eventsResponse.data.map(item =>
              axios.get(`/api/events/${item.event}/`)
            );
            const eventResults = await Promise.all(eventPromises);
            setEvents(eventResults.map(res => res.data));
          } else {
            setEvents([]);
          }
        } catch (eventsErr) {
          console.error('Error fetching class events:', eventsErr);
          setEvents([]);
        }

        try {
          if (classResponse.data.students && Array.isArray(classResponse.data.students)) {
            const studentPromises = classResponse.data.students.map(studentId =>
              axios.get(`/api/students/${studentId}/`)
            );
            const studentResults = await Promise.all(studentPromises);
            setStudents(studentResults.map(res => ({
              id: res.data.id,
              firstName: res.data.first_name,
              lastName: res.data.last_name,
              studentId: res.data.student_id,
              email: res.data.email,
              email_verified: res.data.email_verified,
            })));
          } else {
            try {
              const studentsResponse = await axios.get(`/api/class-students/?class=${id}`);
              if (studentsResponse.data && studentsResponse.data.length > 0) {
                const studentPromises = studentsResponse.data.map(item =>
                  axios.get(`/api/students/${item.student}/`)
                );
                const studentResults = await Promise.all(studentPromises);
                setStudents(studentResults.map(res => ({
                  id: res.data.id,
                  firstName: res.data.first_name,
                  lastName: res.data.last_name,
                  studentId: res.data.student_id,
                  email: res.data.email,
                  email_verified: res.data.email_verified,
                })));
              } else {
                setStudents([]);
              }
            } catch (classStudentsErr) {
              console.error('Error fetching class-students:', classStudentsErr);
              setStudents([]);
            }
          }
        } catch (studentsErr) {
          console.error('Error processing students:', studentsErr);
          setStudents([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching class details:', err);
        setError('Failed to load class details. Please try again.');
        setLoading(false);
      }
    };

    if (id) {
      fetchClassDetails();
    }
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenAssignDialog = async () => {
    try {
      setAssignmentLoading(true);
      setAssignmentError('');

      const schoolId = localStorage.getItem('schoolId');

      const eventsResponse = await axios.get(`/api/events/?school=${schoolId}`);

      if (!eventsResponse.data || !Array.isArray(eventsResponse.data)) {
        throw new Error('Invalid events data received');
      }

      const now = new Date();
      const futureEvents = eventsResponse.data.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= now;
      });

      const assignedEventIds = new Set(events.map(event => event.id));

      const unassignedEvents = futureEvents.filter(event => !assignedEventIds.has(event.id));

      setAvailableEvents(unassignedEvents);
      setSelectedEvents([]);
      setAssignDialogOpen(true);
    } catch (err) {
      console.error('Error fetching available events:', err);
      setAssignmentError('Failed to load available events');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleEventSelectionChange = (event) => {
    setSelectedEvents(event.target.value);
  };

  const handleAssignEvents = async () => {
    try {
      setAssignmentLoading(true);
      setAssignmentError('');

      const assignmentPromises = selectedEvents.map(eventId =>
        axios.post('/api/class-events/', {
          class_instance: id,
          event: eventId
        })
      );

      await Promise.all(assignmentPromises);

      setAssignmentSuccess('Events assigned successfully');
      setAssignDialogOpen(false);

      const eventsResponse = await axios.get(`/api/class-events/?class_instance=${id}`);
      if (eventsResponse.data && eventsResponse.data.length > 0) {
        const eventPromises = eventsResponse.data.map(item =>
          axios.get(`/api/events/${item.event}/`)
        );
        const eventResults = await Promise.all(eventPromises);
        setEvents(eventResults.map(res => res.data));
      }
    } catch (err) {
      console.error('Error assigning events:', err);
      setAssignmentError('Failed to assign events. Please try again.');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleOpenUnassignDialog = (event, e) => {
    e.stopPropagation();
    setEventToUnassign(event);
    setUnassignDialogOpen(true);
  };

  const handleUnassignEvent = async () => {
    if (!eventToUnassign) return;
    
    setUnassignLoading(true);
    try {
      const targetEventId = eventToUnassign.id;
      const facultyId = localStorage.getItem('facultyId');
      
      // First get all class-events for this class and event
      const response = await axios.get(`/api/class-events/`, {
        params: {
          class_instance: id,
          event: targetEventId
        }
      });
      
      if (!response.data || !response.data.length) {
        throw new Error(`No relationship found between class ${id} and event ${targetEventId}`);
      }
      
      // Get the first matching record's ID
      const relationshipId = response.data[0].id;
      console.log(`Found relationship ID ${relationshipId} between class ${id} and event ${targetEventId}`);
      
      // Delete this specific relationship record 
      await axios.delete(`/api/class-events/${relationshipId}/`);
      console.log(`Successfully deleted class-event relationship with ID: ${relationshipId}`);
      
      // Update UI by removing the event from our local state
      setEvents(prevEvents => prevEvents.filter(event => event.id !== targetEventId));
      
      // Close dialog
      setUnassignDialogOpen(false);
      setEventToUnassign(null);
      
    } catch (err) {
      console.error('Error unassigning event:', err);
      alert(`Could not unassign event: ${err.response?.data?.detail || err.message}`);
    } finally {
      setUnassignLoading(false);
    }
  };

  const refreshEventsData = async () => {
    try {
      setLoading(true);
      
      // Clear current events to prevent stale data
      setEvents([]);
      
      // Fetch the latest class-events relationships
      const eventsResponse = await axios.get(`/api/class-events/?class_instance=${id}`);
      
      // If no events are assigned, set events to empty array and return
      if (!eventsResponse.data || !eventsResponse.data.length) {
        setEvents([]);
        setLoading(false);
        return;
      }
      
      const eventIds = eventsResponse.data.map(item => item.event);
      const uniqueEventIds = [...new Set(eventIds)]; // Remove any potential duplicates
      
      // Fetch each event's full details
      const eventPromises = uniqueEventIds.map(eventId =>
        axios.get(`/api/events/${eventId}/`).catch(err => {
          console.error(`Error fetching event ${eventId}:`, err);
          return { data: null }; // Return null for failed requests
        })
      );
      
      const eventResults = await Promise.all(eventPromises);
      const validEvents = eventResults
        .filter(res => res.data !== null)
        .map(res => res.data);
      setEvents(validEvents);
    } catch (err) {
      console.error('Error refreshing events:', err);
      // Optionally show an error message to the user
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress sx={{ color: '#DEA514' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{ my: 2 }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => navigate('/faculty/classes')}
          >
            Go Back
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!classData) {
    return (
      <Alert
        severity="warning"
        sx={{ my: 2 }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => navigate('/faculty/classes')}
          >
            Go Back
          </Button>
        }
      >
        Class not found.
      </Alert>
    );
  }

  const handleDownloadQrCode = (eventId) => {
    window.open(getApiUrl(`/api/event/${eventId}/qr/`), '_blank');
  };

  const isEventPast = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    return eventDate < now;
  };

  const upcomingEvents = events
    .filter(event => !isEventPast(event))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const pastEvents = events
    .filter(event => isEventPast(event))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDownloadAttendanceReport = async (eventId, eventName, e) => {
    e.stopPropagation();
    try {
      setAttendanceLoading(prev => ({ ...prev, [eventId]: true }));
      const facultyId = localStorage.getItem('facultyId');
      const attendanceResponse = await axios.get(
        `/api/attendance/event/${eventId}/class/${id}/?faculty_id=${facultyId}`
      );

      if (!attendanceResponse.data || !Array.isArray(attendanceResponse.data)) {
        throw new Error('Invalid attendance data received');
      }

      const attendanceMap = {};
      attendanceResponse.data.forEach(record => {
        let formattedTimestamp = '';
        if (record.scanned_at) {
          const scanDate = new Date(record.scanned_at);
          formattedTimestamp = scanDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }) + ' ' +
          scanDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          });
        }

        attendanceMap[record.student_id] = {
          attended: true,
          scanned_at: formattedTimestamp,
          location: record.location || '',
          device_id: record.device_id || '',
        };
      });

      let csvContent = "First Name,Last Name,Student ID,Email,Attended,Timestamp,Location,Device ID\n";
      students.forEach(student => {
        const attendanceRecord = attendanceMap[student.id] || {
          attended: false,
          scanned_at: '',
          location: '',
          device_id: '',
        };

        let locationStr = '';
        if (attendanceRecord.location) {
          try {
            const locationObj = JSON.parse(attendanceRecord.location);
            locationStr = `"${locationObj.latitude}, ${locationObj.longitude} (${locationObj.accuracy}m)"`;
          } catch {
            locationStr = `"${attendanceRecord.location}"`;
          }
        }
        const deviceId = attendanceRecord.device_id ? `"${attendanceRecord.device_id}"` : '';

        csvContent += `"${student.firstName}","${student.lastName}","${student.studentId}","${student.email}",` +
                      `${attendanceRecord.attended ? "Yes" : "No"},` +
                      `"${attendanceRecord.scanned_at}",` +
                      `${locationStr},` +
                      `${deviceId}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${classData.name}_${eventName}_attendance.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading attendance report:', err);
    } finally {
      setAttendanceLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  return (
    <Box>
      <Paper sx={{
        p: 3,
        mb: 3,
        bgcolor: '#FFFFFF',
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0,
        }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#2C2C2C', fontWeight: 'bold' }}>
              {classData.name}
            </Typography>
            {classData.semester && (
              <Typography variant="subtitle1" sx={{ color: '#666', mt: 1 }}>
                {classData.semester}
              </Typography>
            )}
          </Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/faculty/classes/${id}/edit`)}
            sx={{
              borderColor: '#DEA514',
              color: '#DEA514',
              '&:hover': {
                borderColor: '#B88A10',
                color: '#B88A10',
              },
            }}
          >
            Edit Class
          </Button>
        </Box>
      </Paper>

      <Paper sx={{
        mb: 3,
        bgcolor: '#FFFFFF',
      }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root.Mui-selected': {
              color: '#DEA514',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#DEA514',
            },
          }}
        >
          <Tab icon={<EventIcon />} label="Events" />
          <Tab icon={<PeopleIcon />} label={`Students (${students.length})`} />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {tabValue === 0 && (
            <>
              <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mb: 2,
              }}>
                <Button
                  variant="contained"
                  onClick={handleOpenAssignDialog}
                  disabled={assignmentLoading}
                  sx={{
                    bgcolor: '#DEA514',
                    '&:hover': {
                      bgcolor: '#B88A10',
                    },
                  }}
                  startIcon={<EventIcon />}
                >
                  Assign Events
                </Button>
              </Box>
              {events.length > 0 ? (
                <>
                  {upcomingEvents.length > 0 && (
                    <>
                      <Typography
                        variant="h6"
                        sx={{
                          mt: 2,
                          mb: 2,
                          color: '#2C2C2C',
                          fontWeight: 'medium',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <CalendarTodayIcon sx={{ color: '#4CAF50' }} />
                        Upcoming Events ({upcomingEvents.length})
                      </Typography>
                      <Grid container spacing={3} sx={{ mt: 1, mb: pastEvents.length > 0 ? 4 : 1 }}>
                        {upcomingEvents.map((event) => {
                          const eventDate = new Date(event.date);
                          const formattedDate = eventDate.toLocaleDateString();
                          const formattedStartTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          let formattedEndTime = '';
                          if (event.end_time) {
                            const endDate = new Date(event.end_time);
                            formattedEndTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          }

                          return (
                            <Grid item xs={12} sm={6} md={4} key={event.id}>
                              <Paper
                                sx={{
                                  p: 3,
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  bgcolor: '#FFFFFF',
                                  borderLeft: '4px solid #4CAF50',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 6px 12px rgba(0,0,0,0.12)',
                                  },
                                }}
                              >
                                <Chip
                                  label="Upcoming"
                                  size="small"
                                  sx={{
                                    bgcolor: '#e8f5e9',
                                    color: '#2e7d32',
                                    fontWeight: 'medium',
                                    border: '1px solid #81c784',
                                    alignSelf: 'flex-start',
                                    mb: 1,
                                  }}
                                />
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: '#2C2C2C',
                                    fontWeight: 'bold',
                                    mb: 2,
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {event.name}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <CalendarTodayIcon sx={{ fontSize: 18, mr: 1, color: '#666' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {formattedDate}
                                  </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <AccessTimeIcon sx={{ fontSize: 18, mr: 1, color: '#666' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {formattedStartTime}{formattedEndTime ? ` - ${formattedEndTime}` : ''}
                                  </Typography>
                                </Box>

                                {event.location && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <LocationOnIcon sx={{ fontSize: 18, mr: 1, color: '#666' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {event.location}
                                    </Typography>
                                  </Box>
                                )}

                                {event.description && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      mb: 2,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 3,
                                      WebkitBoxOrient: 'vertical',
                                    }}
                                  >
                                    {event.description}
                                  </Typography>
                                )}

                                <Box sx={{
                                  mt: 'auto',
                                  pt: 2,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 1,
                                  borderTop: '1px solid #eee',
                                }}>
                                  <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: 1,
                                    mt: 1,
                                  }}>
                                    <Tooltip title="Unassign from class">
                                      <Button
                                        variant="text"
                                        size="small"
                                        startIcon={<LinkOffIcon />}
                                        sx={{
                                          color: '#f44336',
                                          fontSize: '0.75rem',
                                          '&:hover': {
                                            backgroundColor: 'rgba(244, 67, 54, 0.04)',
                                          },
                                        }}
                                        onClick={(e) => handleOpenUnassignDialog(event, e)}
                                      >
                                        Unassign
                                      </Button>
                                    </Tooltip>
                                    
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<QrCode2Icon />}
                                      sx={{
                                        color: '#DEA514',
                                        borderColor: '#DEA514',
                                        fontSize: '0.75rem',
                                        '&:hover': {
                                          borderColor: '#B88A10',
                                          backgroundColor: 'rgba(222, 165, 20, 0.04)',
                                        },
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadQrCode(event.id);
                                      }}
                                    >
                                      QR Code
                                    </Button>
                                  </Box>
                                </Box>
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </>
                  )}

                  {pastEvents.length > 0 && (
                    <>
                      {upcomingEvents.length > 0 && (
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          my: 3,
                        }}>
                          <Divider sx={{ flexGrow: 1 }} />
                          <Typography
                            variant="body2"
                            sx={{
                              px: 2,
                              color: 'text.secondary',
                              fontWeight: 'medium',
                              bgcolor: 'background.paper',
                              py: 0.5,
                              borderRadius: 1,
                            }}
                          >
                            Past Events
                          </Typography>
                          <Divider sx={{ flexGrow: 1 }} />
                        </Box>
                      )}

                      <Typography
                        variant="h6"
                        sx={{
                          mt: upcomingEvents.length > 0 ? 0 : 2,
                          mb: 2,
                          color: '#2C2C2C',
                          fontWeight: 'medium',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <HistoryIcon sx={{ color: '#9e9e9e' }} />
                        Past Events ({pastEvents.length})
                      </Typography>

                      <Grid container spacing={3} sx={{ mt: 1 }}>
                        {pastEvents.map((event) => {
                          const eventDate = new Date(event.date);
                          const formattedDate = eventDate.toLocaleDateString();
                          const formattedStartTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          let formattedEndTime = '';
                          if (event.end_time) {
                            const endDate = new Date(event.end_time);
                            formattedEndTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          }

                          return (
                            <Grid item xs={12} sm={6} md={4} key={event.id}>
                              <Paper
                                sx={{
                                  p: 3,
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  bgcolor: '#FFFFFF',
                                  borderLeft: '4px solid #9e9e9e',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                  opacity: 0.85,
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 6px 12px rgba(0,0,0,0.12)',
                                    opacity: 1,
                                  },
                                }}
                              >
                                <Chip
                                  label="Past"
                                  size="small"
                                  sx={{
                                    bgcolor: '#f5f5f5',
                                    color: '#757575',
                                    fontWeight: 'medium',
                                    border: '1px solid #e0e0e0',
                                    alignSelf: 'flex-start',
                                    mb: 1,
                                  }}
                                />
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: '#2C2C2C',
                                    fontWeight: 'bold',
                                    mb: 2,
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {event.name}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <CalendarTodayIcon sx={{ fontSize: 18, mr: 1, color: '#666' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {formattedDate}
                                  </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <AccessTimeIcon sx={{ fontSize: 18, mr: 1, color: '#666' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {formattedStartTime}{formattedEndTime ? ` - ${formattedEndTime}` : ''}
                                  </Typography>
                                </Box>

                                {event.location && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <LocationOnIcon sx={{ fontSize: 18, mr: 1, color: '#666' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {event.location}
                                    </Typography>
                                  </Box>
                                )}

                                {event.description && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      mb: 2,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 3,
                                      WebkitBoxOrient: 'vertical',
                                    }}
                                  >
                                    {event.description}
                                  </Typography>
                                )}

                                <Box sx={{
                                  mt: 'auto',
                                  pt: 2,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 1,
                                  borderTop: '1px solid #eee',
                                }}>
                                  <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: 1,
                                    mt: 1,
                                  }}>
                                    <Tooltip title="Unassign from class">
                                      <Button
                                        variant="text"
                                        size="small"
                                        startIcon={<LinkOffIcon />}
                                        sx={{
                                          color: '#f44336',
                                          fontSize: '0.75rem',
                                          '&:hover': {
                                            backgroundColor: 'rgba(244, 67, 54, 0.04)',
                                          },
                                        }}
                                        onClick={(e) => handleOpenUnassignDialog(event, e)}
                                      >
                                        Unassign
                                      </Button>
                                    </Tooltip>
                                    
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<DownloadIcon />}
                                      sx={{
                                        color: '#4CAF50',
                                        borderColor: '#4CAF50',
                                        fontSize: '0.75rem',
                                        '&:hover': {
                                          borderColor: '#388E3C',
                                          backgroundColor: 'rgba(76, 175, 80, 0.04)',
                                        },
                                      }}
                                      onClick={(e) => handleDownloadAttendanceReport(event.id, event.name, e)}
                                      disabled={attendanceLoading[event.id]}
                                    >
                                      {attendanceLoading[event.id] ? 'Downloading...' : 'Attendance Report'}
                                    </Button>
                                  </Box>
                                </Box>
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No events assigned to this class yet.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleOpenAssignDialog}
                    sx={{
                      mt: 2,
                      bgcolor: '#DEA514',
                      '&:hover': {
                        bgcolor: '#B88A10',
                      },
                    }}
                  >
                    Assign Events
                  </Button>
                </Box>
              )}
            </>
          )}
          {tabValue === 1 && (
            <>
              {students.length > 0 ? (
                <Paper sx={{
                  bgcolor: '#FFFFFF',
                  boxShadow: 0,
                }}>
                  <List>
                    {students.map((student, index) => (
                      <React.Fragment key={student.id}>
                        <ListItem
                          secondaryAction={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Chip
                                label={student.studentId}
                                size="small"
                                sx={{ bgcolor: '#f0f0f0' }}
                              />
                              <Chip
                                label={student.email_verified ? "Registered" : "Not Registered"}
                                size="small"
                                sx={{
                                  bgcolor: student.email_verified ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)',
                                  color: student.email_verified ? '#2e7d32' : '#d32f2f',
                                  fontWeight: 'medium',
                                  border: `1px solid ${student.email_verified ? 'rgba(46, 125, 50, 0.5)' : 'rgba(211, 47, 47, 0.5)'}`,
                                  icon: student.email_verified ?
                                    <CheckCircleOutlineIcon fontSize="small" sx={{ color: '#2e7d32' }} /> :
                                    <HighlightOffIcon fontSize="small" sx={{ color: '#d32f2f' }} />
                                }}
                              />
                            </Box>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{
                              bgcolor: student.email_verified ? '#e8f5e9' : '#ffebee',
                              color: student.email_verified ? '#2e7d32' : '#d32f2f',
                            }}>
                              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {student.firstName} {student.lastName}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                {student.email}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < students.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No students enrolled in this class yet.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/faculty/classes/${id}/edit`)}
                    sx={{
                      mt: 2,
                      bgcolor: '#DEA514',
                      '&:hover': {
                        bgcolor: '#B88A10',
                      },
                    }}
                  >
                    Add Students
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>

      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Events to {classData?.name}</DialogTitle>
        <DialogContent>
          {assignmentError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {assignmentError}
            </Alert>
          )}
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Select one or more events to assign to this class:
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Select Events</InputLabel>
            <Select
              multiple
              value={selectedEvents}
              onChange={handleEventSelectionChange}
              input={<OutlinedInput label="Select Events" />}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <em>Select events</em>;
                }
                return selected.map(id => {
                  const eventItem = availableEvents.find(e => e.id === id);
                  return eventItem ? eventItem.name : '';
                }).join(', ');
              }}
              disabled={availableEvents.length === 0}
            >
              {availableEvents.length === 0 ? (
                <MenuItem disabled>
                  <em>No available events found</em>
                </MenuItem>
              ) : (
                availableEvents.map((event) => {
                  const eventDate = new Date(event.date);
                  const formattedDate = eventDate.toLocaleDateString();
                  return (
                    <MenuItem key={event.id} value={event.id}>
                      <Checkbox checked={selectedEvents.indexOf(event.id) > -1} />
                      <MuiListItemText 
                        primary={event.name} 
                        secondary={`${formattedDate} - ${event.location || 'No location'}`} 
                      />
                    </MenuItem>
                  );
                })
              )}
            </Select>
            {availableEvents.length === 0 && (
              <FormHelperText>
                No unassigned upcoming events available
              </FormHelperText>
            )}
          </FormControl> 
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setAssignDialogOpen(false)} 
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignEvents}
            disabled={selectedEvents.length === 0 || assignmentLoading}
            sx={{ color: '#DEA514' }}
          >
            {assignmentLoading ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={unassignDialogOpen}
        onClose={() => !unassignLoading && setUnassignDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>Unassign Event</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Are you sure you want to unassign "{eventToUnassign?.name}" from this class?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will remove the event from this class, but won't delete the event itself.
            Students who have already recorded attendance will keep their records.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setUnassignDialogOpen(false)} 
            color="inherit"
            disabled={unassignLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUnassignEvent}
            color="error"
            variant="contained"
            disabled={unassignLoading}
          >
            {unassignLoading ? 'Unassigning...' : 'Unassign Event'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassDetails;
