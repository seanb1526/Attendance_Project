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
        // Email is usually not updated directly for security reasons
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
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};

export default StudentProfileModal;
