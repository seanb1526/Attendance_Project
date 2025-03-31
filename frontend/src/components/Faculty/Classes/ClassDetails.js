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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';

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

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch class details
        const classResponse = await axios.get(`/api/classes/${id}/`);
        setClassData(classResponse.data);
        
        // Fetch class events - use the class-events endpoint
        try {
          const eventsResponse = await axios.get(`/api/class-events/?class_instance=${id}`);
          
          if (eventsResponse.data && eventsResponse.data.length > 0) {
            // Extract event IDs and fetch each event
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
        
        // Fetch students for this class
        // Instead of using a dedicated endpoint, we'll use the fact that students
        // should be part of the class data or available through a relationship
        try {
          // One of these approaches should work depending on your API structure:
          
          // Approach 1: If students are included in the class response
          if (classResponse.data.students && Array.isArray(classResponse.data.students)) {
            // If student IDs are included, fetch each student's details
            const studentPromises = classResponse.data.students.map(studentId => 
              axios.get(`/api/students/${studentId}/`)
            );
            
            const studentResults = await Promise.all(studentPromises);
            setStudents(studentResults.map(res => {
              return {
                id: res.data.id,
                firstName: res.data.first_name,
                lastName: res.data.last_name,
                studentId: res.data.student_id,
                email: res.data.email,
                email_verified: res.data.email_verified
              };
            }));
          } 
          // Approach 2: Use class-student relationship API if available
          else {
            try {
              const studentsResponse = await axios.get(`/api/class-students/?class=${id}`);
              
              if (studentsResponse.data && studentsResponse.data.length > 0) {
                const studentPromises = studentsResponse.data.map(item => 
                  axios.get(`/api/students/${item.student}/`)
                );
                
                const studentResults = await Promise.all(studentPromises);
                setStudents(studentResults.map(res => {
                  return {
                    id: res.data.id,
                    firstName: res.data.first_name,
                    lastName: res.data.last_name,
                    studentId: res.data.student_id,
                    email: res.data.email,
                    email_verified: res.data.email_verified
                  };
                }));
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

  return (
    <Box>
      <Paper sx={{ 
        p: 3, 
        mb: 3,
        bgcolor: '#FFFFFF'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0
        }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#2C2C2C', fontWeight: 'bold' }}>
              {classData.name}
            </Typography>
            {classData.code && (
              <Typography variant="subtitle1" sx={{ color: '#666', mt: 1 }}>
                {classData.code}{classData.section ? ` - Section ${classData.section}` : ''}
              </Typography>
            )}
            <Chip 
              label={classData.semester} 
              sx={{ mt: 1, bgcolor: '#DEA514', color: 'white' }}
            />
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
              }
            }}
          >
            Edit Class
          </Button>
        </Box>
        
        {classData.fullDescription && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Description
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {classData.fullDescription}
            </Typography>
          </Box>
        )}
      </Paper>

      <Paper sx={{ 
        mb: 3,
        bgcolor: '#FFFFFF'
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
              {events.length > 0 ? (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  {events.map((event) => {
                    // Format date and time for display
                    const eventDate = new Date(event.date);
                    const formattedDate = eventDate.toLocaleDateString();
                    const formattedTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={event.id}>
                        <Paper
                          sx={{
                            p: 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            bgcolor: '#FFFFFF',
                            borderLeft: '4px solid #DEA514',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 6px 12px rgba(0,0,0,0.12)',
                            }
                          }}
                        >
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
                              {formattedTime}
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
                            justifyContent: 'space-between',
                            borderTop: '1px solid #eee',
                          }}>
                            <Chip 
                              size="small" 
                              label={
                                event.checkin_before_minutes > 0 
                                  ? `Check-in: ${event.checkin_before_minutes} min before` 
                                  : "No early check-in"
                              }
                              sx={{ 
                                bgcolor: '#f0f0f0',
                                fontSize: '0.7rem',
                              }} 
                            />
                            
                            <Button
                              size="small"
                              startIcon={<QrCode2Icon />}
                              sx={{
                                color: '#DEA514',
                                fontSize: '0.75rem',
                              }}
                            >
                              QR Code
                            </Button>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No events assigned to this class yet.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/faculty/events/', { state: { classId: id } })}
                    sx={{
                      mt: 2,
                      bgcolor: '#DEA514',
                      '&:hover': {
                        bgcolor: '#B88A10',
                      }
                    }}
                  >
                    View Events
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
                  boxShadow: 0
                }}>
                  <List>
                    {students.map((student, index) => {
                      return (
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
                                  }}
                                  icon={student.email_verified ? 
                                    <CheckCircleOutlineIcon fontSize="small" sx={{ color: '#2e7d32' }} /> : 
                                    <HighlightOffIcon fontSize="small" sx={{ color: '#d32f2f' }} />
                                  }
                                />
                              </Box>
                            }
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ 
                                bgcolor: student.email_verified ? '#e8f5e9' : '#ffebee',
                                color: student.email_verified ? '#2e7d32' : '#d32f2f'
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
                      );
                    })}
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
                      }
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
    </Box>
  );
};

export default ClassDetails;
