import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import axios from '../../utils/axios';

const AttendEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Add these lines for mobile detection
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  useEffect(() => {
    // Check if the user is logged in
    const studentId = localStorage.getItem('studentId');
    
    if (!studentId) {
      // Not logged in, redirect to sign in page with a return URL
      navigate(`/student/signin?redirect=/attend/${eventId}`);
    } else {
      // Navigate to QR Scanner with pre-filled event ID
      navigate(`/scan?event=${eventId}`);
    }
  }, [eventId, navigate]);
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '50vh',  // Better vertical centering
      p: 2  // Add padding for smaller screens
    }}>
      <CircularProgress size={isMobile ? 40 : 50} />
      <Typography 
        variant={isMobile ? "body1" : "h6"} 
        align="center"
        sx={{ mt: 2 }}
      >
        Processing attendance...
      </Typography>
    </Box>
  );
};

export default AttendEvent; 