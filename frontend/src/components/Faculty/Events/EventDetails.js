import { Button } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { getApiUrl } from '../../../utils/urlHelper';

const handleDownloadQrCode = (eventId) => {
  // Using the browser's capability to download a file with dynamic URL
  window.open(getApiUrl(`/api/event/${eventId}/qr/`), '_blank');
};

// When rendering event details, add end time formatting:
const formatDateTime = (eventData) => {
  if (!eventData.date) return { date: 'TBD', time: 'TBD' };
  
  const startDate = new Date(eventData.date);
  const formattedDate = startDate.toLocaleDateString();
  const startTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  let timeDisplay = startTime;
  if (eventData.end_time) {
    const endDate = new Date(eventData.end_time);
    const endTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    timeDisplay = `${startTime} - ${endTime}`;
  }
  
  return { date: formattedDate, time: timeDisplay };
};