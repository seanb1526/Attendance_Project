import React, { useState } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';

// Mock data - replace with real data later
const mockEvents = [
  {
    id: 1,
    name: 'Guest Speaker: AI Ethics',
    date: '2024-03-15',
    time: '14:00',
    location: 'Lecture Hall A',
    description: 'A discussion on the ethical implications of AI in modern society',
    assignedClasses: ['CS101-A']
  },
  {
    id: 2,
    name: 'Programming Workshop',
    date: '2024-03-22',
    time: '15:30',
    location: 'Computer Lab 2',
    description: 'Hands-on workshop on advanced programming concepts',
    assignedClasses: []
  },
  {
    id: 3,
    name: 'Tech Industry Panel',
    date: '2024-04-05',
    time: '13:00',
    location: 'Main Auditorium',
    description: 'Industry professionals discuss current trends and career opportunities',
    assignedClasses: ['CS201-B']
  },
];

// Mock classes data - replace with real data later
const mockClasses = [
  { id: 1, name: 'Introduction to Computer Science', code: 'CS101-A' },
  { id: 2, name: 'Data Structures', code: 'CS201-B' },
  { id: 3, name: 'Algorithm Analysis', code: 'CS301-A' },
];

const EventsList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');

  const handleAssignEvent = (event) => {
    setSelectedEvent(event);
    setAssignDialogOpen(true);
  };

  const handleAssignSubmit = () => {
    // Here you would make an API call to assign the event to the class
    console.log(`Assigning event ${selectedEvent.id} to class ${selectedClass}`);
    setAssignDialogOpen(false);
    setSelectedClass('');
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

      <Grid container spacing={3}>
        {mockEvents.map((event) => (
          <Grid item xs={12} md={6} lg={4} key={event.id}>
            <Paper
              sx={{
                p: 3,
                bgcolor: '#FFFFFF',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: '#2C2C2C' }}>
                {event.name}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarTodayIcon sx={{ fontSize: 20, mr: 1, color: '#666' }} />
                  <Typography variant="body2" color="text.secondary">
                    {event.date} at {event.time}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ fontSize: 20, mr: 1, color: '#666' }} />
                  <Typography variant="body2" color="text.secondary">
                    {event.location}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                {event.description}
              </Typography>

              {event.assignedClasses.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
                    Assigned to:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {event.assignedClasses.map((className) => (
                      <Chip
                        key={className}
                        label={className}
                        size="small"
                        sx={{ bgcolor: '#DEA514', color: 'white' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<QrCode2Icon />}
                  fullWidth
                  sx={{
                    borderColor: '#DEA514',
                    color: '#DEA514',
                    '&:hover': {
                      borderColor: '#B88A10',
                      color: '#B88A10',
                    }
                  }}
                >
                  View QR
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleAssignEvent(event)}
                  sx={{
                    bgcolor: '#DEA514',
                    '&:hover': {
                      bgcolor: '#B88A10',
                    }
                  }}
                >
                  Assign
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
        <DialogTitle>Assign Event to Class</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Class</InputLabel>
            <Select
              value={selectedClass}
              label="Select Class"
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {mockClasses.map((classItem) => (
                <MenuItem key={classItem.id} value={classItem.code}>
                  {classItem.name} ({classItem.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignSubmit}
            variant="contained"
            sx={{
              bgcolor: '#DEA514',
              '&:hover': {
                bgcolor: '#B88A10',
              }
            }}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventsList;
