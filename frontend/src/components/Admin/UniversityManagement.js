import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from '../../utils/axios';

const UniversityManagement = ({ adminInfo }) => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentUniversity, setCurrentUniversity] = useState({
    id: null,
    name: '',
    faculty_domain: '',
    student_domain: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/schools/');
      
      if (Array.isArray(response.data)) {
        // Transform the data to match our UI structure
        const universitiesData = response.data.map(school => ({
          id: school.id,
          name: school.name,
          faculty_domain: school.faculty_domain,
          student_domain: school.student_domain
        }));
        
        setUniversities(universitiesData);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
      setError('Failed to load universities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, university = null) => {
    setDialogMode(mode);
    setFormErrors({});
    
    if (university) {
      setCurrentUniversity(university);
    } else {
      setCurrentUniversity({ 
        id: null, 
        name: '', 
        faculty_domain: '', 
        student_domain: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    if (processing) return;
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUniversity({
      ...currentUniversity,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!currentUniversity.name?.trim()) {
      errors.name = 'University name is required';
    }
    
    if (!currentUniversity.faculty_domain?.trim()) {
      errors.faculty_domain = 'Faculty email domain is required';
    } else if (!isValidDomain(currentUniversity.faculty_domain)) {
      errors.faculty_domain = 'Please enter a valid domain (e.g., university.edu)';
    }
    
    if (!currentUniversity.student_domain?.trim()) {
      errors.student_domain = 'Student email domain is required';
    } else if (!isValidDomain(currentUniversity.student_domain)) {
      errors.student_domain = 'Please enter a valid domain (e.g., university.edu)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const isValidDomain = (domain) => {
    // Simple domain validation - should contain at least one dot
    // and no spaces or special characters except dots and hyphens
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const handleSubmitUniversity = async () => {
    try {
      if (!validateForm()) {
        return;
      }
      
      setProcessing(true);
      
      if (dialogMode === 'add') {
        // Add new university via API
        const response = await axios.post('/api/schools/', {
          name: currentUniversity.name,
          faculty_domain: currentUniversity.faculty_domain,
          student_domain: currentUniversity.student_domain
        });
        
        // Add new university to state
        setUniversities([...universities, {
          id: response.data.id,
          name: response.data.name,
          faculty_domain: response.data.faculty_domain,
          student_domain: response.data.student_domain
        }]);
        
        setSuccess('University added successfully!');
      } else {
        // Update existing university
        await axios.put(`/api/schools/${currentUniversity.id}/`, {
          name: currentUniversity.name,
          faculty_domain: currentUniversity.faculty_domain,
          student_domain: currentUniversity.student_domain
        });
        
        // Update university in state
        setUniversities(universities.map(univ => 
          univ.id === currentUniversity.id ? currentUniversity : univ
        ));
        
        setSuccess('University updated successfully!');
      }
      
      // Close the dialog and show success message
      handleCloseDialog();
      setSnackbarOpen(true);
      
    } catch (error) {
      console.error('Error saving university:', error);
      
      // Handle API validation errors
      if (error.response?.data) {
        const apiErrors = {};
        
        // Map API error responses to our form fields
        Object.entries(error.response.data).forEach(([key, value]) => {
          apiErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        
        if (Object.keys(apiErrors).length > 0) {
          setFormErrors(apiErrors);
        } else {
          setError('Failed to save university. Please check your inputs and try again.');
          setSnackbarOpen(true);
        }
      } else {
        setError('Network error. Please try again later.');
        setSnackbarOpen(true);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUniversity = async (id) => {
    if (window.confirm('Are you sure you want to delete this university? This will remove all associated faculty, students, classes, and events.')) {
      try {
        setProcessing(true);
        
        // Delete university via API
        await axios.delete(`/api/schools/${id}/`);
        
        // Remove university from state
        setUniversities(universities.filter(univ => univ.id !== id));
        
        setSuccess('University deleted successfully!');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Error deleting university:', error);
        setError('Failed to delete university. It may have associated records that prevent deletion.');
        setSnackbarOpen(true);
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // If user doesn't have permission to view this page
  if (adminInfo?.role === 'sub') {
    return (
      <Alert severity="warning">
        You don't have permission to manage universities. This feature is available only to master and co-administrators.
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: '#DEA514' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2C2C2C' }}>
          University Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
          sx={{
            bgcolor: '#DEA514',
            '&:hover': {
              bgcolor: '#B88A10',
            }
          }}
        >
          Add University
        </Button>
      </Box>
      
      {error && !snackbarOpen && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Faculty Domain</TableCell>
                <TableCell>Student Domain</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {universities.length > 0 ? (
                universities.map((university) => (
                  <TableRow 
                    hover
                    key={university.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {university.name}
                    </TableCell>
                    <TableCell>{university.faculty_domain}</TableCell>
                    <TableCell>{university.student_domain}</TableCell>
                    <TableCell>
                      <IconButton 
                        aria-label="edit"
                        onClick={() => handleOpenDialog('edit', university)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        aria-label="delete"
                        onClick={() => handleDeleteUniversity(university.id)}
                        disabled={processing}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No universities found. Add your first university to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New University' : 'Edit University'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="University Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentUniversity.name}
            onChange={handleInputChange}
            required
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="faculty_domain"
            label="Faculty Email Domain (e.g., university.edu)"
            type="text"
            fullWidth
            variant="outlined"
            value={currentUniversity.faculty_domain}
            onChange={handleInputChange}
            required
            error={!!formErrors.faculty_domain}
            helperText={formErrors.faculty_domain || "Domain only, without @ symbol"}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="student_domain"
            label="Student Email Domain (e.g., students.university.edu)"
            type="text"
            fullWidth
            variant="outlined"
            value={currentUniversity.student_domain}
            onChange={handleInputChange}
            required
            error={!!formErrors.student_domain}
            helperText={formErrors.student_domain || "Domain only, without @ symbol"}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitUniversity}
            variant="contained"
            disabled={processing}
            sx={{
              bgcolor: '#DEA514',
              '&:hover': {
                bgcolor: '#B88A10',
              }
            }}
          >
            {processing ? <CircularProgress size={24} /> : (dialogMode === 'add' ? 'Add' : 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={success || error}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={success ? "success" : "error"}
          sx={{ width: '100%' }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UniversityManagement;
