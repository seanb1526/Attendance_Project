import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import axios from '../../utils/axios';
import { useNavigate, useLocation } from 'react-router-dom';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    // Check if user is authenticated
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      navigate('/student/signin?redirect=/scan');
      return;
    }
    
    // Check if there's an event ID in the URL query params
    const params = new URLSearchParams(location.search);
    const eventIdFromUrl = params.get('event');
    
    if (eventIdFromUrl) {
      setEventId(eventIdFromUrl);
      fetchEventDetails(eventIdFromUrl);
    }
    
    return () => {
      // Clean up scanner when component unmounts
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(error => {
          console.error("Failed to stop scanner", error);
        });
      }
    };
  }, [location, navigate]);

  const handleScanStart = () => {
    setScanning(true);
    setError('');
    setSuccess('');
    
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrCodeRef.current = new Html5Qrcode("reader");
    
    html5QrCodeRef.current.start(
      { facingMode: "environment" },
      config,
      onScanSuccess,
      onScanFailure
    ).catch(err => {
      setError('Failed to start scanner: ' + err);
      setScanning(false);
    });
  };

  const handleScanStop = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().then(() => {
        setScanning(false);
      }).catch(err => {
        console.error('Failed to stop scanner:', err);
        setScanning(false);
      });
    } else {
      setScanning(false);
    }
  };

  const onScanSuccess = (decodedText) => {
    handleScanStop();
    
    // Parse the URL to get the event ID
    try {
      // Handle both URL formats and direct event IDs
      let id;
      
      if (decodedText.includes('/attend/')) {
        const url = new URL(decodedText);
        const pathParts = url.pathname.split('/');
        id = pathParts[pathParts.length - 1];
      } else {
        // If it's just a number, assume it's a direct event ID
        id = decodedText.trim();
      }
      
      setEventId(id);
      fetchEventDetails(id);
    } catch (e) {
      setError('Invalid QR code format. Please try again.');
    }
  };

  const onScanFailure = (error) => {
    // We don't need to show every scan failure
    // Only log it to console
    console.log('QR scan error:', error);
  };

  // Fetch event details to show in confirmation dialog
  const fetchEventDetails = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/events/${id}/`);
      setEventDetails(response.data);
      setConfirmOpen(true);
    } catch (error) {
      setError('Error fetching event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get the user's location for attendance tracking
  const getLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null); // Geolocation not supported, proceed without location
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = `${position.coords.latitude},${position.coords.longitude}`;
            resolve(coords);
          },
          (error) => {
            console.warn('Error getting location:', error);
            resolve(null); // Proceed without location if there's an error
          },
          { timeout: 10000 }
        );
      }
    });
  };

  // Confirm attendance
  const handleConfirmAttendance = async () => {
    setLoading(true);
    setConfirmOpen(false);
    
    try {
      // Get the student ID from localStorage
      const studentId = localStorage.getItem('studentId');
      
      if (!studentId) {
        setError('You must be logged in to record attendance.');
        setLoading(false);
        return;
      }
      
      // Get location if possible
      const locationData = await getLocation();
      
      // Record attendance
      const response = await axios.post('/api/attendance/', {
        student: studentId,
        event: eventId,
        location: locationData // This may be null if location access is denied
      });
      
      setSuccess('Attendance successfully recorded!');
    } catch (error) {
      if (error.response && error.response.status === 400 && 
          error.response.data.non_field_errors && 
          error.response.data.non_field_errors.includes('The fields student, event must make a unique set.')) {
        setSuccess('You have already recorded attendance for this event.');
      } else {
        setError('Failed to record attendance. Please try again.');
        console.error('Attendance error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom align="center">
          Scan Attendance QR Code
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        {scanning ? (
          <Box sx={{ width: '100%', mb: 2 }}>
            <div id="reader" style={{ width: '100%' }}></div>
            <Button 
              variant="outlined" 
              color="secondary" 
              fullWidth 
              onClick={handleScanStop}
              sx={{ mt: 2 }}
            >
              Cancel Scan
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button 
              variant="contained" 
              onClick={handleScanStart}
              disabled={loading}
              sx={{
                bgcolor: '#DEA514',
                '&:hover': {
                  bgcolor: '#B88A10',
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Start Scanning'}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      >
        <DialogTitle>Confirm Attendance</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to record your attendance for:
            {eventDetails && (
              <Box component="span" sx={{ display: 'block', mt: 1, fontWeight: 'bold' }}>
                {eventDetails.name}
                <br />
                {/* Handle different date formats */}
                {new Date(eventDetails.start_time || eventDetails.date).toLocaleString()}
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAttendance} 
            color="primary" 
            variant="contained"
            sx={{
              bgcolor: '#DEA514',
              '&:hover': {
                bgcolor: '#B88A10',
              }
            }}
          >
            Confirm Attendance
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QRScanner;
