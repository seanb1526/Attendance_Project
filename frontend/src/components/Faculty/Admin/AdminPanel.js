import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminPanel = ({ adminId, adminRole }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [events, setEvents] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [schoolName, setSchoolName] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const storedSchoolId = localStorage.getItem('schoolId');
        const storedFacultyId = localStorage.getItem('facultyId');
        
        if (!storedSchoolId || !storedFacultyId) {
          throw new Error('School or faculty ID not found');
        }
        
        setSchoolId(storedSchoolId);
        setFacultyId(storedFacultyId);
        
        // Fetch school information
        const schoolResponse = await axios.get(`/api/schools/${storedSchoolId}/`);
        setSchoolName(schoolResponse.data.name);
        
        // Fetch all events for this school
        const eventsResponse = await axios.get(`/api/events/?school=${storedSchoolId}`);
        
        // Filter events by school ID to ensure we only show events from this university
        const filteredEvents = eventsResponse.data.filter(event => 
          String(event.school) === String(storedSchoolId)
        );
        
        // Sort events by date (nearest first)
        const sortedEvents = [...filteredEvents].sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
        
        setEvents(sortedEvents);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading admin data:', err);
        setError('Failed to load admin data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditEvent = (eventId) => {
    navigate(`/faculty/events/${eventId}/edit`);
  };

  const handleOpenDeleteDialog = (event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      // When deleting as admin, we need to make sure we're passing the faculty_id param
      // to let the backend know who is deleting the event
      await axios.delete(`/api/events/${eventToDelete.id}/`, {
        params: { faculty_id: facultyId }
      });
      
      // Remove the deleted event from the state
      setEvents(prevEvents => prevEvents.filter(e => e.id !== eventToDelete.id));
      
      // Show success message
      setError(null);
      setSuccess('Event deleted successfully');
      
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event. Please try again.');
    }
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const isOwnEvent = (event) => {
    return String(event.faculty) === String(facultyId);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: '#DEA514' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 1,
          color: '#2C2C2C',
          fontWeight: 'bold'
        }}
      >
        Administrator Panel
      </Typography>
      
      <Typography 
        variant="subtitle1" 
        sx={{ 
          mb: 3, 
          color: '#666',
        }}
      >
        {schoolName} - University Administrator
      </Typography>
      
      <Paper sx={{ width: '100%', bgcolor: 'white' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            '& .MuiTab-root.Mui-selected': {
              color: '#DEA514',
              fontWeight: 'bold',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#DEA514',
            },
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab label="Events Management" />
          <Tab label="Admin Information" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <Typography variant="h6" sx={{ mb: 2 }}>
            {schoolName} Events
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.length > 0 ? (
                  events.map((event) => {
                    const datetime = formatDateTime(event.date);
                    return (
                      <TableRow key={event.id}>
                        <TableCell>{event.name}</TableCell>
                        <TableCell>
                          {datetime.date}{' '}
                          {datetime.time}
                        </TableCell>
                        <TableCell>
                          {isOwnEvent(event) ? (
                            'You (Creator)'
                          ) : (
                            'Another Faculty'
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEditEvent(event.id)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            color="error"
                            onClick={() => handleOpenDeleteDialog(event)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No events found for this school</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Administrator Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Role
              </Typography>
              <Typography variant="body1">
                University Administrator (Sub-Admin)
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                School
              </Typography>
              <Typography variant="body1">
                {schoolName}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Permissions
              </Typography>
              <Typography variant="body1">
                As a University Administrator, you can view, edit, and delete any events within your university.
              </Typography>
            </Box>
          </Box>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Your administrator credentials are linked to your faculty account. For more information or to request additional permissions, please contact a master administrator.
          </Alert>
        </TabPanel>
      </Paper>
      
      {/* Delete confirmation dialog */}
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

export default AdminPanel;
