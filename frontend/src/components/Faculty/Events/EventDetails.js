import { Button } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';

const handleDownloadQrCode = (eventId) => {
  // Using the browser's capability to download a file
  window.open(`http://localhost:8000/api/event/${eventId}/qr/`, '_blank');
}; 