import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  console.log("StudentId from localStorage:", localStorage.getItem('studentId'));
  
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('studentId') !== null;
  console.log("isAuthenticated value:", isAuthenticated);

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem('authToken');
    localStorage.removeItem('studentId');
    localStorage.removeItem('userType');
    // Redirect to auth page
    navigate('/auth');
  };

  return (
    <Box sx={{ 
      pt: 12, 
      pb: 4,
      minHeight: '100vh',
      bgcolor: '#F5F5DC'
    }}>
      <Container maxWidth="sm">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4
        }}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              color: '#2C2C2C',
              fontWeight: 'bold'
            }}
          >
            Student Dashboard
          </Typography>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderColor: '#DEA514',
              color: '#DEA514',
              '&:hover': {
                borderColor: '#B88A10',
                color: '#B88A10',
              }
            }}
          >
            Logout
          </Button>
        </Box>

        <Paper 
          elevation={2}
          sx={{
            p: { xs: 2, sm: 4 },
            bgcolor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: { xs: 2, sm: 3 },
            width: '100%',
            maxWidth: '500px',
            mx: 'auto'
          }}
        >
          <Typography 
            variant="h6" 
            align="center"
            color="text.secondary"
          >
            Scan QR Code for Event Attendance
          </Typography>

          <Box 
            sx={{
              width: { xs: '150px', sm: '200px' },
              height: { xs: '150px', sm: '200px' },
              border: '2px dashed #DEA514',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}
          >
            <QrCodeScannerIcon 
              sx={{ 
                fontSize: { xs: 60, sm: 80 },
                color: '#DEA514',
                opacity: 0.7
              }} 
            />
          </Box>

          {isAuthenticated ? (
            <Button
              component={Link}
              to="/scan"
              variant="contained"
              size="large"
              fullWidth
              startIcon={<QrCodeScannerIcon />}
              sx={{
                maxWidth: { xs: '100%', sm: '300px' },
                bgcolor: '#DEA514',
                '&:hover': {
                  bgcolor: '#B88A10',
                }
              }}
            >
              Scan QR Code
            </Button>
          ) : (
            <Button
              component={Link}
              to="/student/signin"
              variant="contained"
              size="large"
              startIcon={<QrCodeScannerIcon />}
              sx={{
                bgcolor: '#DEA514',
                '&:hover': {
                  bgcolor: '#B88A10',
                }
              }}
            >
              Sign In to Scan
            </Button>
          )}

          <Typography 
            variant="body2" 
            align="center"
            color="text.secondary"
            sx={{ mt: 2 }}
          >
            {isAuthenticated 
              ? "Click the button above to scan an event's QR code" 
              : "You must be signed in to scan attendance QR codes"}
          </Typography>
        </Paper>

        {/* We can add a recent scans section later */}
      </Container>
    </Box>
  );
};

export default StudentDashboard;
