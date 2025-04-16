import React, { useState, useRef, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import axios from '../../utils/axios';
import { clearToken } from '../../utils/auth';
import StudentProfileModal from './StudentProfileModal';
import AttendanceHistory from './AttendanceHistory';

const StudentDashboard = () => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('studentId') !== null;

  useEffect(() => {
    // Fetch student details when dashboard loads
    const fetchStudentDetails = async () => {
      try {
        const studentId = localStorage.getItem('studentId');
        if (studentId) {
          const response = await axios.get(`/api/students/${studentId}/`);
          setStudentDetails(response.data);
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };
    
    fetchStudentDetails();
    
    return () => {
      stopCamera();
    };
  }, []);

  const handleLogout = () => {
    clearToken();
    navigate('/');
  };

  const startCamera = async () => {
    setError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported by your browser');
      }
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      setScanning(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => startQrScanning());
        };
      }
    } catch (err) {
      setError('Camera error: ' + (err.message || 'Unknown error'));
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const startQrScanning = () => {
    if (!canvasRef.current || !videoRef.current) return;
    scanIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
      const width = video.videoWidth;
      const height = video.videoHeight;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, width, height);
      const imageData = context.getImageData(0, 0, width, height);
      const code = jsQR(imageData.data, width, height, { inversionAttempts: 'dontInvert' });
      if (code) {
        handleQrCodeDetected(code.data);
      }
    }, 500);
  };

  const handleQrCodeDetected = (data) => {
    stopCamera();
    try {
      const id = data.includes('/attend/') ? new URL(data).pathname.split('/').pop() : data.trim();
      setEventId(id);
      fetchEventDetails(id);
    } catch {
      setError('Invalid QR code format. Please try again.');
    }
  };

  const fetchEventDetails = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/events/${id}/`);
      setEventDetails(response.data);
    } catch {
      setError('Failed to get event details. Please try again.');
      setEventId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAttendance = async () => {
    setLoading(true);
    setConfirmOpen(false);
    try {
      const studentId = localStorage.getItem('studentId');
      if (!studentId) throw new Error('You must be logged in to record attendance');
      
      // Try to get location data
      let locationData = null;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            });
          });
          
          // Format location data for storage
          locationData = JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
          
          console.log("Location captured:", locationData);
        } catch (geoError) {
          console.log("Geolocation error or permission denied:", geoError.message);
          // Continue without location data
        }
      }
      
      // Get device identifier - with explicit stringification
      let deviceId = null;
      try {
        deviceId = getDeviceId();
        if (deviceId && deviceId.length > 200) {
          deviceId = deviceId.substring(0, 200); // Truncate if too long
        }
        console.log("Device ID generated:", deviceId);
      } catch (e) {
        console.error("Error generating device ID:", e);
        // Continue without device ID
      }
      
      // Build the payload
      const payload = { 
        student: studentId, 
        event: eventId
      };
      
      // Only add these if they exist
      if (locationData) {
        payload.location = locationData;
      }
      
      if (deviceId) {
        payload.device_id = deviceId;
      }
      
      console.log("Full attendance payload:", JSON.stringify(payload));
      
      // Send the request
      const response = await axios.post('/api/attendance/', payload);
      
      setSuccess('Attendance recorded successfully!');
      setTimeout(() => {
        setEventId(null);
        setEventDetails(null);
      }, 3000);
    } catch (error) {
      console.error("Attendance error:", error);
      
      // Detailed error logging
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        console.error("Response data:", error.response.data);
        
        // Display specific error messages
        if (error.response.data.device_id) {
          setError(`Device ID error: ${error.response.data.device_id.join(', ')}`);
        } else if (error.response.data.non_field_errors) {
          setError(`Error: ${error.response.data.non_field_errors.join(', ')}`);
        } else {
          setError(`Server error: ${error.response.status}`);
        }
      } else {
        setError('Failed to record attendance: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get a consistent device ID
  const getDeviceId = () => {
    try {
      let deviceId = localStorage.getItem('deviceId');
      
      if (!deviceId) {
        // Create a fingerprint from available browser data
        const fingerprint = [
          navigator.userAgent,
          navigator.language,
          window.screen.colorDepth,
          (window.screen.width + 'x' + window.screen.height)
        ].filter(Boolean).join('|');
        
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
          hash = ((hash << 5) - hash) + fingerprint.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }
        
        deviceId = 'dev_' + Math.abs(hash).toString(16);
        localStorage.setItem('deviceId', deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error("Error generating device ID:", error);
      return "unknown_device"; // Provide a fallback value
    }
  };

  const handleOpenProfileModal = () => {
    setProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setProfileModalOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ pt: 12, pb: 4, minHeight: '100vh', bgcolor: '#F5F5DC' }}>
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ color: '#2C2C2C', fontWeight: 'bold' }}>
            Student Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PersonIcon />}
              onClick={handleOpenProfileModal}
              sx={{ borderColor: '#DEA514', color: '#DEA514', '&:hover': { borderColor: '#B88A10', color: '#B88A10' } }}
            >
              Profile
            </Button>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ borderColor: '#DEA514', color: '#DEA514', '&:hover': { borderColor: '#B88A10', color: '#B88A10' } }}
            >
              Logout
            </Button>
          </Box>
        </Box>

        <Paper sx={{ mb: 3, bgcolor: '#FFFFFF' }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root.Mui-selected': {
                color: '#DEA514',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#DEA514',
              },
            }}
          >
            <Tab icon={<QrCodeScannerIcon />} label="Scan QR" />
            <Tab icon={<HistoryIcon />} label="Attendance History" />
          </Tabs>
        </Paper>

        {currentTab === 0 ? (
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: { xs: 2, sm: 3 }, width: '100%', maxWidth: '500px', mx: 'auto' }}>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {!eventId ? (
              <>
                <Typography variant="h6" align="center" color="text.secondary">
                  Scan QR Code for Event Attendance
                </Typography>
                <Box sx={{ width: '100%', maxWidth: '400px', height: '300px', mx: 'auto', mb: 3, border: scanning ? '2px solid #4caf50' : '1px solid #ccc', position: 'relative', overflow: 'hidden', borderRadius: 1, bgcolor: '#000' }}>
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: scanning ? 'block' : 'none' }} />
                  {!scanning && (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }}>
                      <Typography>Camera inactive</Typography>
                    </Box>
                  )}
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {!scanning ? (
                    <Button variant="contained" onClick={startCamera} color="primary" sx={{ minWidth: '150px' }}>
                      Start Scanning
                    </Button>
                  ) : (
                    <Button variant="outlined" onClick={stopCamera} color="error" sx={{ minWidth: '150px' }}>
                      Stop Scanning
                    </Button>
                  )}
                </Box>
              </>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Event Details
                </Typography>
                {loading ? (
                  <CircularProgress sx={{ my: 3 }} />
                ) : eventDetails ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" color="primary">{eventDetails.name}</Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>{eventDetails.location || 'No location specified'}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {new Date(eventDetails.date).toLocaleDateString()}, {new Date(eventDetails.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {eventDetails.end_time && (
                        <> - {new Date(eventDetails.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                      )}
                    </Typography>
                    
                    {/* Show check-in window information */}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Check-in window: {eventDetails.checkin_before_minutes > 0 ? 
                        `${eventDetails.checkin_before_minutes} min before` : 
                        'Starts at event time'} to {eventDetails.checkin_after_minutes > 0 ? 
                        `${eventDetails.checkin_after_minutes} min after start` : 
                        'event start time only'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, mt: 3, flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center' }}>
                      <Button variant="contained" onClick={() => setConfirmOpen(true)} disabled={loading} fullWidth color="primary">
                        Confirm Attendance
                      </Button>
                      <Button variant="outlined" onClick={() => { setEventId(null); setEventDetails(null); }} fullWidth>
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Typography color="error" sx={{ my: 3 }}>
                    Failed to load event details. Please try again.
                  </Typography>
                )}
              </>
            )}
          </Paper>
        ) : (
          <AttendanceHistory />
        )}
      </Container>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Attendance</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to record your attendance for this event?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmAttendance} color="primary" variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Profile Modal */}
      <StudentProfileModal 
        open={profileModalOpen} 
        onClose={handleCloseProfileModal} 
        studentDetails={studentDetails}
        setStudentDetails={setStudentDetails}
      />
    </Box>
  );
};

export default StudentDashboard;
