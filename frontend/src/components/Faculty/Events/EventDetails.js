import { Button } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { getApiUrl } from '../../../utils/urlHelper';

const handleDownloadQrCode = (eventId) => {
  // Using the browser's capability to download a file with dynamic URL
  window.open(getApiUrl(`/api/event/${eventId}/qr/`), '_blank');
};