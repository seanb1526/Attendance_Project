import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button,
  useTheme,
  useMediaQuery 
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

const StudentDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      pt: isMobile ? 10 : 12, 
      pb: 4,
      minHeight: '100vh',
      bgcolor: '#F5F5DC'
    }}>
      <Container maxWidth="sm">
        <Typography 
          variant="h4" 
          component="h1" 
          align="center"
          sx={{ 
            mb: 4,
            color: '#2C2C2C',
            fontWeight: 'bold'
          }}
        >
          Student Dashboard
        </Typography>

        <Paper 
          elevation={2}
          sx={{
            p: 4,
            bgcolor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3
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
              width: '200px',
              height: '200px',
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
                fontSize: 80, 
                color: '#DEA514',
                opacity: 0.7
              }} 
            />
          </Box>

          <Button
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
            Scan QR Code
          </Button>

          <Typography 
            variant="body2" 
            align="center"
            color="text.secondary"
            sx={{ mt: 2 }}
          >
            Click the button above to scan an event's QR code
          </Typography>
        </Paper>

        {/* We can add a recent scans section later */}
      </Container>
    </Box>
  );
};

export default StudentDashboard;
