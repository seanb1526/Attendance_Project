import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../utils/axios';
import { canEditEvent } from '../../../utils/adminUtils';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QrCode2Icon from '@mui/icons-material/QrCode2';

const EditEvent = ({ adminStatus }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);

  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    date: '',
    time: '', // Keep for backwards compatibility
    endTime: '', // Add end time field
    location: '',
    checkin_before_minutes: 15,
    checkin_after_minutes: 15,
  });

  // Generate 15-minute interval options from 0 to 120 minutes (2 hours)
  const timeIntervalOptions = [];
  for (let minutes = 0; minutes <= 120; minutes += 15) {
    timeIntervalOptions.push(minutes);
  }

  useEffect(() => {
    const fetchEventAndCheckPermission = async () => {
      try {
        setLoading(true);
        setCheckingPermission(true);
        
        // Get the current logged in faculty ID
        const facultyId = localStorage.getItem('facultyId');
        
        if (!facultyId) {
          setError('You must be logged in to edit events');
          setLoading(false);
          return;
        }
        
        console.log("EditEvent - Faculty ID:", facultyId);
        console.log("EditEvent - Admin status:", adminStatus);
        
        // Fetch the event details
        const eventResponse = await axios.get(`/api/events/${id}/`);
        const eventData = eventResponse.data;
        
        console.log("EditEvent - Event data:", eventData);
        
        // Make sure we have valid school ID for the event
        if (!eventData.school) {
          console.error("Event doesn't have a school ID");
          setError("This event doesn't have proper school information");
          setLoading(false);
          setCheckingPermission(false);
          return;
        }
        
        // Check if the faculty has permission to edit this event
        const permission = await canEditEvent(
          eventData.school,
          facultyId,
          eventData.faculty,
          adminStatus
        );
        
        console.log("EditEvent - Permission result:", permission);
        
        setHasPermission(permission);
        
        if (!permission) {
          setError('You do not have permission to edit this event');
          setLoading(false);
          setCheckingPermission(false);
          return;
        }
        
        // Format date and time for form
        const eventDate = new Date(eventData.date);
        const formattedDate = eventDate.toISOString().split('T')[0];
        const formattedTime = eventDate.toTimeString().slice(0, 5);

        // Format end time if available
        let formattedEndTime = '';
        if (eventData.end_time) {
          const endDate = new Date(eventData.end_time);
          formattedEndTime = endDate.toTimeString().slice(0, 5);
        }

        setEventData({
          name: eventData.name || '',
          description: eventData.description || '',
          date: formattedDate,
          time: formattedTime,
          endTime: formattedEndTime,
          location: eventData.location || '',
          checkin_before_minutes: eventData.checkin_before_minutes || 15,
          checkin_after_minutes: eventData.checkin_after_minutes || 15,
          faculty: localStorage.getItem('facultyId'),
        });

        setLoading(false);
        setCheckingPermission(false);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
        setLoading(false);
        setCheckingPermission(false);
      }
    };

    fetchEventAndCheckPermission();
  }, [id, adminStatus]);

  const handleChange = (field) => (event) => {
    setEventData({
      ...eventData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasPermission) {
      setError('You do not have permission to edit this event');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Format the date and time for the API
      const dateTime = new Date(`${eventData.date}T${eventData.time}`).toISOString();

      // Format end time if provided
      let endDateTime = null;
      if (eventData.endTime && eventData.endTime.trim() !== '') {
        endDateTime = new Date(`${eventData.date}T${eventData.endTime}`).toISOString();
      }

      // Get faculty ID and school ID from local storage
      const facultyId = localStorage.getItem('facultyId');
      const schoolId = localStorage.getItem('schoolId');

      const eventPayload = {
        name: eventData.name,
        description: eventData.description,
        date: dateTime,
        end_time: endDateTime, // Make sure we're sending this even if null
        location: eventData.location,
        faculty: facultyId,
        school: schoolId,
        checkin_before_minutes: eventData.checkin_before_minutes,
        checkin_after_minutes: eventData.checkin_after_minutes,
      };

      console.log('Updating event with payload:', eventPayload); // Debug log

      // Make the API request to update the event
      await axios.put(`/api/events/${id}/?faculty_id=${facultyId}`, eventPayload);

      setSuccess('Event updated successfully');
      // Optionally redirect after success
      setTimeout(() => {
        navigate('/faculty/events');
      }, 2000);
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err.response?.data?.message || 'Failed to update event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      // Delete the event
      const facultyId = localStorage.getItem('facultyId');
      await axios.delete(`/api/events/${id}/?faculty_id=${facultyId}`);

      setSuccess('Event deleted successfully');
      // Redirect after deletion
      setTimeout(() => {
        navigate('/faculty/events');
      }, 1500);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err.response?.data?.message || 'Failed to delete event. Please try again.');
      setConfirmDelete(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading || checkingPermission) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: '#DEA514' }} />
      </Box>
    );
  }

  if (!hasPermission) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "You don't have permission to edit this event"}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/faculty/events')}
          sx={{
            bgcolor: '#DEA514',
            '&:hover': { bgcolor: '#B88A10' },
          }}
        >
          Back to Events
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          color: '#2C2C2C',
          fontWeight: 'bold',
        }}
      >
        Edit Event
      </Typography>

      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 4,
          maxWidth: 800,
          mx: 'auto',
          bgcolor: '#FFFFFF',
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Event Name"
              required
              value={eventData.name}
              onChange={handleChange('name')}
              placeholder="e.g., Guest Speaker: AI Ethics"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={eventData.description}
              onChange={handleChange('description')}
              placeholder="Provide details about the event"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              required
              InputLabelProps={{ shrink: true }}
              value={eventData.date}
              onChange={handleChange('date')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Start Time"
              type="time"
              required
              InputLabelProps={{ shrink: true }}
              value={eventData.time}
              onChange={handleChange('time')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="End Time"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={eventData.endTime}
              onChange={handleChange('endTime')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              required
              value={eventData.location}
              onChange={handleChange('location')}
              placeholder="e.g., Lecture Hall A"
            />
          </Grid>

          {/* Check-in time window options */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2, mb: 2, fontSize: '1rem' }}>
              Attendance Check-in Window
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Allow Check-in Before</InputLabel>
              <Select
                value={eventData.checkin_before_minutes}
                onChange={handleChange('checkin_before_minutes')}
                label="Allow Check-in Before"
              >
                {timeIntervalOptions.map((minutes) => (
                  <MenuItem key={`before-${minutes}`} value={minutes}>
                    {minutes === 0 ? 'Not allowed' : `${minutes} minutes before`}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                How long before the event can students check in?
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Allow Check-in After</InputLabel>
              <Select
                value={eventData.checkin_after_minutes}
                onChange={handleChange('checkin_after_minutes')}
                label="Allow Check-in After"
              >
                {timeIntervalOptions.map((minutes) => (
                  <MenuItem key={`after-${minutes}`} value={minutes}>
                    {minutes === 0 ? 'Not allowed' : `${minutes} minutes after`}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                How long after the event starts can students still check in?
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                mt: 2,
              }}
            >
              <Button
                variant="contained"
                color="error"
                onClick={() => setConfirmDelete(true)}
                disabled={loading}
                sx={{
                  width: isMobile ? '100%' : 'auto',
                }}
              >
                Delete Event
              </Button>

              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexDirection: isMobile ? 'column' : 'row',
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate('/faculty/events')}
                  fullWidth={isMobile}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth={isMobile}
                  disabled={loading}
                  sx={{
                    bgcolor: '#DEA514',
                    '&:hover': {
                      bgcolor: '#B88A10',
                    },
                  }}
                >
                  {loading ? 'Updating...' : 'Update Event'}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Confirmation Dialog for Delete */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete Event?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={() => {
          setError(null);
          setSuccess(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => {
            setError(null);
            setSuccess(null);
          }}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditEvent;