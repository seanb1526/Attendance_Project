import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Chip, 
  CircularProgress, 
  Alert
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import axios from '../../utils/axios';

const AttendanceHistory = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      try {
        const studentId = localStorage.getItem('studentId');
        if (!studentId) {
          throw new Error('Authentication required');
        }

        const response = await axios.get(`/api/students/${studentId}/attendance/`);
        setAttendanceRecords(response.data);
      } catch (err) {
        console.error("Error fetching attendance history:", err);
        setError('Failed to load your attendance history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceHistory();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <CircularProgress sx={{ color: '#DEA514' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#FFFFFF', mt: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" component="h2" sx={{ color: '#2C2C2C', display: 'flex', alignItems: 'center' }}>
          <CheckCircleOutlineIcon sx={{ mr: 1, color: '#4CAF50' }} />
          Your Attendance History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {attendanceRecords.length > 0 
            ? `You have attended ${attendanceRecords.length} event${attendanceRecords.length === 1 ? '' : 's'}.` 
            : 'You have not attended any events yet.'}
        </Typography>
      </Box>

      {attendanceRecords.length > 0 ? (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {attendanceRecords.map((record, index) => (
            <React.Fragment key={record.id}>
              <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', py: 2 }}>
                <Box sx={{ display: 'flex', width: '100%', mb: 1, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                    {record.event_name}
                  </Typography>
                  <Chip 
                    label="Attended" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#e8f5e9',
                      color: '#2e7d32',
                      fontWeight: 'medium',
                      border: '1px solid #81c784'
                    }} 
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EventIcon sx={{ fontSize: 16, mr: 1, color: '#666' }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(record.event_date)}
                  </Typography>
                </Box>

                {record.event_location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon sx={{ fontSize: 16, mr: 1, color: '#666' }} />
                    <Typography variant="body2" color="text.secondary">
                      {record.event_location}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ fontSize: 16, mr: 1, color: '#666' }} />
                  <Typography variant="body2" color="text.secondary">
                    Check-in time: {formatDate(record.scanned_at)}
                  </Typography>
                </Box>
              </ListItem>
              {index < attendanceRecords.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 3, bgcolor: '#f8f8f8', borderRadius: 1 }}>
          <Typography color="text.secondary">
            You haven't attended any events yet. When you check in to an event, it will appear here.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AttendanceHistory;
