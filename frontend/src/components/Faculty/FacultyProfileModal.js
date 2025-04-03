// frontend/src/components/Faculty/FacultyProfileModal.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

const FacultyProfileModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fetch faculty data when modal opens
  useEffect(() => {
    if (open) {
      fetchFacultyData();
    }
  }, [open]);

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      const facultyId = localStorage.getItem('facultyId');
      if (!facultyId) {
        throw new Error('Faculty ID not found');
      }
  
      const response = await axios.get(`/api/facultys/${facultyId}/`);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '', // Store the email in the state
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching faculty data:', err);
      setError('Failed to load your profile information.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

// Update this in frontend/src/components/Faculty/FacultyProfileModal.js
const handleSubmit = async () => {
  try {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const facultyId = localStorage.getItem('facultyId');
    if (!facultyId) {
      throw new Error('Faculty ID not found');
    }

    // Use the new endpoint specifically for updating profile
    await axios.put(`/api/faculty/${facultyId}/update-profile/`, {
      first_name: formData.first_name,
      last_name: formData.last_name
    });
    
    setSuccess('Profile updated successfully');
    
    // Wait a moment before closing the modal
    setTimeout(() => {
      onClose();
      // Refresh the page to show updated name
      window.location.reload();
    }, 1500);
  } catch (err) {
    console.error('Error updating profile:', err);
    if (err.response) {
      console.error('Error response:', err.response.data);
    }
    setError('Failed to update profile. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const facultyId = localStorage.getItem('facultyId');
      if (!facultyId) {
        throw new Error('Faculty ID not found');
      }

      // Delete the faculty account
      await axios.delete(`/api/facultys/${facultyId}/`);
      
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('facultyId');
      localStorage.removeItem('schoolId');
      
      // Close the modal and redirect to home
      onClose();
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.response?.data?.message || 'Failed to delete account. Please try again.');
      setConfirmDelete(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            Your Profile
          </Typography>
        </DialogTitle>
        <DialogContent>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {!loading && !error && (
            <Box component="form" sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                fullWidth
                label="First Name"
                value={formData.first_name}
                onChange={handleChange('first_name')}
                disabled={loading}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Last Name"
                value={formData.last_name}
                onChange={handleChange('last_name')}
                disabled={loading}
              />
            </Box>
          )}

          <Divider sx={{ mt: 4, mb: 2 }} />
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ color: 'error.main', mb: 2 }}>
              Danger Zone
            </Typography>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => setConfirmDelete(true)}
              disabled={loading}
            >
              Delete Account
            </Button>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
              This will permanently delete your account, all classes, and all events you've created.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#DEA514',
              '&:hover': {
                bgcolor: '#B88A10',
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Delete */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <DialogTitle>Delete Your Account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This will permanently remove:
            <ul>
              <li>Your faculty profile</li>
              <li>All classes you've created</li>
              <li>All events you've created</li>
              <li>All attendance records for your events</li>
            </ul>
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="error" autoFocus>
            Yes, Delete My Account
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FacultyProfileModal;