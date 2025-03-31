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
            setStudents(studentResults.map(res => ({
              id: res.data.id,
              firstName: res.data.first_name,
              lastName: res.data.last_name,
              studentId: res.data.student_id,
              email: res.data.email
            })));
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
                setStudents(studentResults.map(res => ({
                  id: res.data.id,
                  firstName: res.data.first_name,
                  lastName: res.data.last_name,
                  studentId: res.data.student_id,
                  email: res.data.email
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
          {tabValue === 0 ? (
            events.length > 0 ? (
              <Grid container spacing={3}>
                {events.map((event) => (
                  <Grid item xs={12} md={6} key={event.id}>
                    <Paper sx={{ 
                      p: 3,
                      bgcolor: '#FFFFFF',
                      boxShadow: 1,
                    }}>
                      <Typography variant="h6">{event.name}</Typography>
                      <Typography variant="subtitle2" sx={{ color: '#666', my: 1 }}>
                        Date: {new Date(event.date).toLocaleDateString()}
                      </Typography>
                      {event.description && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {event.description}
                        </Typography>
                      )}
                      {event.attendance_count !== undefined && (
                        <Typography variant="body2">
                          Attendance: {event.attendance_count} students
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No events created for this class yet.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/faculty/events/add', { state: { classId: id } })}
                  sx={{
                    mt: 2,
                    bgcolor: '#DEA514',
                    '&:hover': {
                      bgcolor: '#B88A10',
                    }
                  }}
                >
                  Create Event
                </Button>
              </Box>
            )
          ) : (
            students.length > 0 ? (
              <Paper sx={{ 
                bgcolor: '#FFFFFF',
                boxShadow: 0
              }}>
                <List>
                  {students.map((student, index) => (
                    <React.Fragment key={student.id}>
                      <ListItem>
                        <ListItemText 
                          primary={`${student.firstName} ${student.lastName}`}
                          secondary={student.email}
                        />
                        <Chip 
                          label={student.studentId}
                          size="small"
                          sx={{ bgcolor: '#f0f0f0' }}
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
                  onClick={() => navigate(`/faculty/classes/edit/${id}`, { state: { tabIndex: 1 } })}
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
            )
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ClassDetails;
