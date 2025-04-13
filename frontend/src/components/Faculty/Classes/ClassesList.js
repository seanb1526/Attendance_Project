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
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';

const ClassesList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const facultyId = localStorage.getItem('facultyId');
        
        if (!facultyId) {
          setError('Faculty ID not found. Please sign in again.');
          setLoading(false);
          return;
        }
        
        // Fetch classes where faculty ID matches
        const response = await axios.get(`/api/classes/?faculty=${facultyId}`);
        
        // Check if we got valid data back
        if (!Array.isArray(response.data)) {
          console.error('Unexpected API response format:', response.data);
          setError('Received invalid data from server.');
          setLoading(false);
          return;
        }
        
        // Transform the data to match our UI needs
        const classesWithDetails = response.data.map(classItem => {
          // Try to parse metadata from description field if it exists
          let code = '';
          let section = '';
          let description = '';
          
          try {
            if (classItem.description) {
              const metadata = JSON.parse(classItem.description);
              code = metadata.code || '';
              section = metadata.section || '';
              description = metadata.description || '';
            }
          } catch (e) {
            console.error('Error parsing class metadata:', e);
          }
          
          // Use the semester directly from the API, with fallback to current year
          const currentYear = new Date().getFullYear();
          const defaultSemester = `Spring ${currentYear}`;
          
          return {
            id: classItem.id,
            name: classItem.name,
            code,
            section,
            semester: classItem.semester || defaultSemester,
            description,
            students: Array.isArray(classItem.students) ? classItem.students.length : 0
          };
        });
        
        setClasses(classesWithDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError('Failed to load classes. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, []);

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
          My Classes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/faculty/classes/add')}
          sx={{
            bgcolor: '#DEA514',
            '&:hover': {
              bgcolor: '#B88A10',
            }
          }}
        >
          Add New Class
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#DEA514' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : classes.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4, 
          px: 2, 
          bgcolor: '#FFFFFF', 
          borderRadius: 1,
          boxShadow: 1
        }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            You haven't created any classes yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/faculty/classes/add')}
            sx={{
              bgcolor: '#DEA514',
              '&:hover': {
                bgcolor: '#B88A10',
              }
            }}
          >
            Create Your First Class
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {classes.map((classItem) => (
            <Grid item xs={12} md={6} lg={4} key={classItem.id}>
              <Paper
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  bgcolor: '#FFFFFF',
                  minHeight: '200px',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => navigate(`/faculty/classes/${classItem.id}`)}
              >
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#2C2C2C',
                      mb: 1 
                    }}
                  >
                    {classItem.name}
                  </Typography>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: '#666',
                      mb: 2
                    }}
                  >
                    {classItem.code ? (
                      classItem.section ? 
                        `${classItem.code} - Section ${classItem.section}` : 
                        classItem.code
                    ) : ''}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={classItem.semester} 
                      size="small"
                      sx={{ 
                        bgcolor: '#DEA514',
                        color: 'white'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: '#666' }}>
                    <PeopleIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">
                      {classItem.students} Students
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ClassesList;
