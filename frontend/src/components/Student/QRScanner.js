import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Container,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import axios from '../../utils/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import jsQR from 'jsqr';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Check URL parameters for event ID
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const eventIdFromUrl = params.get('event');
    
    if (eventIdFromUrl) {
      setEventId(eventIdFromUrl);
      fetchEventDetails(eventIdFromUrl);
    }
  }, [location.search]);

  const fetchEventDetails = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/events/${id}/`);
      setEventDetails(response.data);
    } catch (error) {
      console.error('Error fetching event details:', error);
      setError('Failed to get event details. Please try again.');
      setEventId(null);
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    setError('');
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported by your browser');
      }
      
      // Stop any existing stream first
      stopCamera();
      
      console.log("Requesting camera access...");
      
      // For laptops, we use the "user" facing camera (front camera)
      // For mobile, use "environment" (back camera)
      const facingMode = isMobile ? "environment" : "user";
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: facingMode }, 
        audio: false 
      });
      
      console.log("Camera access granted");
      streamRef.current = stream;
      
      // Set scanning to true immediately to ensure it's true when we start QR scanning
      setScanning(true);
      
      if (videoRef.current) {
        console.log("Setting video source to stream");
        videoRef.current.srcObject = stream;
        
        // Add an event listener to ensure video is displayed
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          videoRef.current.play()
            .then(() => {
              console.log("Video playback started");
              // Start QR scanning after video is playing
              // Add a small delay to ensure state is updated
              setTimeout(() => {
                console.log("Starting QR scan with scanning state:", scanning);
                startQrScanning();
              }, 500);
            })
            .catch(err => console.error("Play error:", err));
        };
      } else {
        console.error("Video element not found");
        throw new Error("Video element not found");
      }
    } catch (err) {
      console.error('Camera start error:', err);
      setError('Camera error: ' + (err.message || 'Unknown error'));
      setScanning(false);
    }
  };

  const stopCamera = () => {
    console.log("Stopping camera...");
    
    // Clear scanning interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    // Stop all tracks in the stream
    if (streamRef.current) {
      console.log("Stopping all tracks in stream");
      streamRef.current.getTracks().forEach(track => {
        console.log(`Stopping track: ${track.kind}`);
        track.stop();
      });
      streamRef.current = null;
    }
    
    // Clear video source
    if (videoRef.current) {
      console.log("Clearing video source");
      videoRef.current.srcObject = null;
    }
    
    setScanning(false);
    console.log("Camera stopped");
  };

  // Start scanning for QR codes
  const startQrScanning = () => {
    if (!canvasRef.current || !videoRef.current) {
      console.log("Cannot start QR scanning: missing references");
      return;
    }
    
    // Force scanning state to be true
    if (!scanning) {
      console.log("Scanning state was false, setting to true");
      setScanning(true);
    }
    
    console.log("Starting QR code scanning interval");
    
    // Create a scanning interval
    scanIntervalRef.current = setInterval(() => {
      // Force reference check again without checking scanning state
      if (!videoRef.current || !canvasRef.current) {
        console.log("Skipping scan: missing elements");
        return;
      }
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Make sure video has loaded
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        console.log("Video not ready yet");
        return;
      }
      
      // Set canvas dimensions
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      if (width === 0 || height === 0) {
        console.log("Video dimensions not available", width, height);
        return;
      }
      
      console.log("Scanning frame", width, "x", height);
      canvas.width = width;
      canvas.height = height;
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, width, height);
      
      // Get image data for QR processing
      try {
        const imageData = context.getImageData(0, 0, width, height);
        
        // Make canvas visible for debugging
        canvas.style.display = 'block';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.opacity = '0.3';
        canvas.style.zIndex = '100';
        
        console.log("Processing image data for QR code");
        const code = jsQR(imageData.data, width, height, {
          inversionAttempts: "dontInvert",
        });
        
        if (code) {
          console.log("QR code detected!", code.data);
          handleQrCodeDetected(code.data);
        }
      } catch (err) {
        console.error("QR processing error:", err);
      }
    }, 500); // Slow down to 500ms for debugging
  };

  // Handle QR code detection
  const handleQrCodeDetected = (data) => {
    // Stop scanning
    stopCamera();
    
    // Extract event ID from QR code data
    try {
      let id;
      
      // Handle both URL and direct ID formats
      if (data.includes('/attend/') || data.includes('?event=')) {
        // It's a URL, extract the ID
        if (data.includes('/attend/')) {
          const url = new URL(data);
          const pathParts = url.pathname.split('/');
          id = pathParts[pathParts.length - 1];
        } else {
          const url = new URL(data);
          id = url.searchParams.get('event');
        }
      } else {
        // Assume it's a direct event ID
        id = data.trim();
      }
      
      if (!id) {
        throw new Error("Could not extract event ID from QR code");
      }
      
      console.log("Extracted event ID:", id);
      setEventId(id);
      fetchEventDetails(id);
    } catch (err) {
      console.error("Error processing QR code data:", err);
      setError("Invalid QR code format. Please try again.");
    }
  };

  // Handle attendance confirmation
  const handleConfirmAttendance = async () => {
    setLoading(true);
    setConfirmOpen(false);
    
    try {
      const studentId = localStorage.getItem('studentId');
      
      if (!studentId) {
        throw new Error("You must be logged in to record attendance");
      }
      
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
      
      // Get device identifier
      const deviceId = getDeviceId();
      
      // Create the payload
      const payload = {
        student: studentId,
        event: eventId,
        location: locationData
      };
      
      // Only add device_id if it's not null or undefined
      if (deviceId) {
        payload.device_id = deviceId;
      }
      
      console.log("Sending attendance payload:", payload);
      
      // Include location data and device ID in the attendance record
      const response = await axios.post('/api/attendance/', payload);
      console.log("Attendance response:", response.data);
      
      setSuccess("Attendance recorded successfully!");
      
      // Reset after success
      setTimeout(() => {
        setEventId(null);
        setEventDetails(null);
      }, 3000);
    } catch (error) {
      console.error("Attendance error:", error);
      // Add more detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      
      if (error.response && error.response.status === 400 && 
          error.response.data.non_field_errors && 
          error.response.data.non_field_errors.includes('The fields student, event must make a unique set.')) {
        setSuccess('You have already recorded attendance for this event.');
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
        ].join('|');
        
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
          hash = ((hash << 5) - hash) + fingerprint.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }
        
        deviceId = 'dev_' + Math.abs(hash).toString(16);
        localStorage.setItem('deviceId', deviceId);
      }
      
      // Make sure the device ID doesn't exceed the max length in the database
      if (deviceId && deviceId.length > 200) {
        deviceId = deviceId.substring(0, 200);
      }
      
      return deviceId;
    } catch (error) {
      console.error("Error generating device ID:", error);
      return null; // Return null if there's an error, to avoid breaking attendance submission
    }
  };

  // For testing when camera access is not available
  const handleMockScan = () => {
    stopCamera();
    setEventId("mock-event-123");
    setEventDetails({
      id: "mock-event-123",
      name: "Mock Event",
      location: "Test Location",
      date: new Date().toISOString()
    });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4, p: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          QR Code Scanner
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        
        <Paper sx={{ p: 3, mb: 3 }}>
          {!eventId ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography paragraph>
                Scan a QR code to record your attendance.
              </Typography>
              
              {/* Camera display box */}
              <Box
                sx={{
                  width: '100%',
                  maxWidth: '400px',
                  height: '300px',
                  mx: 'auto',
                  mb: 3,
                  border: scanning ? '2px solid #4caf50' : '1px solid #ccc',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 1,
                  bgcolor: '#000'
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: scanning ? 'block' : 'none'
                  }}
                />
                
                {!scanning && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white'
                    }}
                  >
                    <Typography>Camera inactive</Typography>
                  </Box>
                )}
                
                {/* Hidden canvas for QR processing */}
                <canvas 
                  ref={canvasRef} 
                  style={{ display: 'none' }}
                />
                
                {/* Scanner overlay */}
                {scanning && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '200px',
                      height: '200px',
                      border: '2px solid #4caf50',
                      borderRadius: '8px',
                      boxShadow: '0 0 0 2000px rgba(0, 0, 0, 0.3)',
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </Box>
              
              {/* Camera control buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                {!scanning ? (
                  <Button 
                    variant="contained" 
                    onClick={startCamera}
                    color="primary"
                    sx={{ minWidth: '150px' }}
                  >
                    Start Scanning
                  </Button>
                ) : (
                  <Button 
                    variant="outlined" 
                    onClick={stopCamera}
                    color="error"
                    sx={{ minWidth: '150px' }}
                  >
                    Stop Scanning
                  </Button>
                )}
                
                <Button 
                  variant="outlined"
                  onClick={handleMockScan}
                  sx={{ minWidth: '150px' }}
                >
                  Demo (No Camera)
                </Button>
              </Box>
              
              <Typography sx={{ mt: 2, fontSize: '0.9rem', color: 'text.secondary' }}>
                Point your camera at a QR code to scan it. On mobile devices, the back camera will be used.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
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
                    {new Date(eventDetails.date).toLocaleString()}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mt: 3,
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'center'
                  }}>
                    <Button
                      variant="contained"
                      onClick={() => setConfirmOpen(true)}
                      disabled={loading}
                      fullWidth={isMobile}
                      color="primary"
                    >
                      Confirm Attendance
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setEventId(null);
                        setEventDetails(null);
                      }}
                      fullWidth={isMobile}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography color="error" sx={{ my: 3 }}>
                  Failed to load event details. Please try again.
                </Typography>
              )}
            </Box>
          )}
        </Paper>
        
        <Button 
          variant="text" 
          onClick={() => navigate('/student/dashboard')}
          sx={{ mt: 2 }}
        >
          Return to Dashboard
        </Button>
      </Box>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Attendance</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to record your attendance for this event?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAttendance} 
            color="primary" 
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QRScanner;
