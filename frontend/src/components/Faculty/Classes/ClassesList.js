import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';

// Mock data - we'll replace this with real data later
const mockClasses = [
  {
    id: 1,
    name: 'Introduction to Computer Science',
    code: 'CS101',
    section: 'A',
    students: 45,
    semester: 'Spring 2024'
  },
  {
    id: 2,
    name: 'Data Structures',
    code: 'CS201',
    section: 'B',
    students: 38,
    semester: 'Spring 2024'
  },
  {
    id: 3,
    name: 'Algorithm Analysis',
    code: 'CS301',
    section: 'A',
    students: 32,
    semester: 'Spring 2024'
  },
];

const ClassesList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

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

      <Grid container spacing={3}>
        {mockClasses.map((classItem) => (
          <Grid item xs={12} md={6} lg={4} key={classItem.id}>
            <Paper
              sx={{
                p: 3,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                bgcolor: '#FFFFFF',
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
                  {classItem.code} - Section {classItem.section}
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
    </Box>
  );
};

export default ClassesList;
