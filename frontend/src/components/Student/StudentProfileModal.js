import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Alert, 
  CircularProgress,
  Divider
} from '@mui/material';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

const StudentProfileModal = ({ open, onClose, studentDetails, setStudentDetails }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    student_id: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletionLoading, setDeletionLoading] = useState(false);

  useEffect(() => {
    if (studentDetails) {
      setFormData({
        first_name: studentDetails.first_name || '',
        last_name: studentDetails.last_name || '',
        student_id: studentDetails.student_id || '',
        email: studentDetails.email || ''
      });
    }
  }, [studentDetails, open]);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const studentId = localStorage.getItem('studentId');
      if (!studentId) {
        throw new Error('Authentication error. Please sign in again.');
      }

      const response = await axios.put(`/api/students/${studentId}/update/`, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        student_id: formData.student_id,
      });

      setStudentDetails({
        ...studentDetails,
        ...response.data
      });
      setSuccess('Profile updated successfully!');

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletionLoading(true);
    try {
      const studentId = localStorage.getItem('studentId');
      if (!studentId) {
        throw new Error('Authentication error. Please sign in again.');
      }

      await axios.delete(`/api/students/${studentId}/delete/`);
      
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('studentId');
      localStorage.removeItem('userType');
      
      // Close modal and navigate to home/login page
      onClose();
      navigate('/auth');
    } catch (err) {
      console.error("Error deleting account:", err);
      setError('Failed to delete your account. Please try again.');
      setConfirmDelete(false);
    } finally {
      setDeletionLoading(false);
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
              <CircularProgress sx={{ color: '#DEA514' }} />
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

          {!loading && (
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
              <TextField
                margin="normal"
                fullWidth
                label="Student ID"
                value={formData.student_id}
                onChange={handleChange('student_id')}
                disabled={loading}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Email"
                value={formData.email}
                disabled={true} // Email is read-only
                helperText="Email cannot be changed. Contact support if needed."
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
              fullWidth
            >
              Delete Account
            </Button>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
              This will permanently delete your account and all your attendance records.
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
          <Typography>
            Are you sure you want to delete your account? This will permanently remove:
          </Typography>
          <Box component="ul" sx={{ mt: 2, pl: 2 }}>
            <li>Your student profile</li>
            <li>All your attendance records</li>
            <li>All your class enrollments</li>
          </Box>
          <Typography sx={{ mt: 2, fontWeight: 'bold', color: 'error.main' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error" 
            variant="contained"
            disabled={deletionLoading}
          >
            {deletionLoading ? 'Deleting...' : 'Delete My Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentProfileModal;
