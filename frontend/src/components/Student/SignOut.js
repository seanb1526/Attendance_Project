import { clearToken } from '../../utils/auth';

// ...existing code...
const handleSignOut = () => {
  clearToken();
  // ...existing sign-out logic...
};
