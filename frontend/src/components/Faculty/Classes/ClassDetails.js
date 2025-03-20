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
        // Fetch the class data
        const classResponse = await axios.get(`/api/classes/${id}/`);
        
        // Parse metadata if available
        let metadata = {
          code: '',
          section: '',
          semester: 'Current Semester',
          description: ''
        };
        
        try {
          if (classResponse.data.description) {
            const parsedMetadata = JSON.parse(classResponse.data.description);
            metadata = { ...metadata, ...parsedMetadata };
          }
        } catch (e) {
          console.error('Error parsing class metadata:', e);
        }
        
        // Combine the class data with the parsed metadata
        const enhancedClassData = {
          ...classResponse.data,
          code: metadata.code,
          section: metadata.section,
          semester: metadata.semester,
          fullDescription: metadata.description
        };
        
        setClassData(enhancedClassData);
        
        // Fetch students enrolled in this class
        if (Array.isArray(classResponse.data.students) && classResponse.data.students.length > 0) {
          const studentPromises = classResponse.data.students.map(studentId => 
            axios.get(`/api/students/${studentId}/`)
          );
          
          try {
            const studentResponses = await Promise.all(studentPromises);
            const studentData = studentResponses.map(res => res.data);
            setStudents(studentData);
          } catch (studentError) {
            console.error('Error fetching students:', studentError);
            setStudents([]);
          }
        }
        
        // Fetch events associated with this class
        try {
          const eventsResponse = await axios.get(`/api/events/?class=${id}`);
          setEvents(eventsResponse.data || []);
        } catch (eventError) {
          console.error('Error fetching events:', eventError);
          setEvents([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching class details:', error);
        setError('Failed to load class details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchClassDetails();
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
                          primary={`${student.first_name} ${student.last_name}`}
                          secondary={student.email}
                        />
                        <Chip 
                          label={student.student_id}
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
