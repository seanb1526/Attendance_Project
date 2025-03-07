import React from 'react';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import { useParams } from 'react-router-dom';

// Mock data - we'll replace this with real data later
const mockClass = {
  id: 1,
  name: 'Introduction to Computer Science',
  code: 'CS101',
  section: 'A',
  semester: 'Spring 2024',
  description: 'An introductory course covering the basics of computer science and programming.',
  students: 45,
  events: [
    { id: 1, name: 'Guest Speaker: AI Ethics', date: '2024-03-15', attended: 32 },
    { id: 2, name: 'Programming Workshop', date: '2024-03-22', attended: 28 },
  ]
};

const ClassDetails = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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
              {mockClass.name}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#666', mt: 1 }}>
              {mockClass.code} - Section {mockClass.section}
            </Typography>
            <Chip 
              label={mockClass.semester} 
              sx={{ mt: 1, bgcolor: '#DEA514', color: 'white' }}
            />
          </Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            sx={{ minWidth: isMobile ? '100%' : 'auto' }}
          >
            Edit Class
          </Button>
        </Box>
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
          <Tab icon={<PeopleIcon />} label="Students" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {tabValue === 0 ? (
          <Grid container spacing={3}>
            {mockClass.events.map((event) => (
              <Grid item xs={12} md={6} key={event.id}>
                <Paper sx={{ 
                  p: 3,
                  bgcolor: '#FFFFFF'
                }}>
                  <Typography variant="h6">{event.name}</Typography>
                  <Typography variant="subtitle2" sx={{ color: '#666', my: 1 }}>
                    Date: {event.date}
                  </Typography>
                  <Typography variant="body2">
                    Attendance: {event.attended} students
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ 
            bgcolor: '#FFFFFF'
          }}>
            <List>
              {[...Array(5)].map((_, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText 
                      primary={`Student ${index + 1}`}
                      secondary={`student${index + 1}@university.edu`}
                    />
                    <Chip 
                      label={`${Math.floor(Math.random() * 5)} events attended`}
                      size="small"
                    />
                  </ListItem>
                  {index < 4 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ClassDetails;
