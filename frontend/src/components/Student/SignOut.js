import { clearToken } from '../../utils/auth';

// ...existing code...
const handleSignOut = () => {
  clearToken();
  navigate('/'); // Navigate to landing page
};
