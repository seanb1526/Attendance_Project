import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import axios from '../../utils/axios';

const AttendEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
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
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
      <CircularProgress />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Processing attendance...
      </Typography>
    </Box>
  );
};

export default AttendEvent; 