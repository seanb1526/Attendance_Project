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
  TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from '../../utils/axios';

const UniversityManagement = ({ adminInfo }) => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentUniversity, setCurrentUniversity] = useState({
    id: null,
    name: '',
    domain: '',
    location: ''
  });

  useEffect(() => {
    // For now, just simulate some data instead of making actual API calls
    setTimeout(() => {
      setUniversities([
        { id: 1, name: 'Salisbury University', domain: 'salisbury.edu', location: 'Maryland, USA' },
        { id: 2, name: 'University of Maryland', domain: 'umd.edu', location: 'Maryland, USA' },
        { id: 3, name: 'Towson University', domain: 'towson.edu', location: 'Maryland, USA' },
        { id: 4, name: 'Johns Hopkins University', domain: 'jhu.edu', location: 'Maryland, USA' },
        { id: 5, name: 'UMBC', domain: 'umbc.edu', location: 'Maryland, USA' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleOpenDialog = (mode, university = null) => {
    setDialogMode(mode);
    if (university) {
      setCurrentUniversity(university);
    } else {
      setCurrentUniversity({ id: null, name: '', domain: '', location: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUniversity({
      ...currentUniversity,
      [name]: value
    });
  };

  const handleSubmitUniversity = async () => {
    try {
      // Validate form
      if (!currentUniversity.name || !currentUniversity.domain) {
        alert('Please fill in all required fields');
        return;
      }
      
      // This is a placeholder for the API call
      if (dialogMode === 'add') {
        // Add new university
        const newUniv = { ...currentUniversity, id: Date.now() };
        setUniversities([...universities, newUniv]);
      } else {
        // Update existing university
        setUniversities(universities.map(univ => 
          univ.id === currentUniversity.id ? currentUniversity : univ
        ));
      }
      
      // Close the dialog
      handleCloseDialog();
      
    } catch (error) {
      console.error('Error saving university:', error);
      alert('Failed to save university. Please try again.');
    }
  };

  const handleDeleteUniversity = async (id) => {
    if (window.confirm('Are you sure you want to delete this university?')) {
      try {
        setUniversities(universities.filter(univ => univ.id !== id));
      } catch (error) {
        console.error('Error deleting university:', error);
        alert('Failed to delete university. Please try again.');
      }
    }
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

  if (error) {
    return <Alert severity="error">{error}</Alert>;
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
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {universities.map((university) => (
                <TableRow 
                  hover
                  key={university.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {university.name}
                  </TableCell>
                  <TableCell>{university.domain}</TableCell>
                  <TableCell>{university.location}</TableCell>
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
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
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
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="domain"
            label="Email Domain (e.g., university.edu)"
            type="text"
            fullWidth
            variant="outlined"
            value={currentUniversity.domain}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="location"
            label="Location"
            type="text"
            fullWidth
            variant="outlined"
            value={currentUniversity.location}
            onChange={handleInputChange}
            sx={{ mb: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitUniversity}
            variant="contained"
            sx={{
              bgcolor: '#DEA514',
              '&:hover': {
                bgcolor: '#B88A10',
              }
            }}
          >
            {dialogMode === 'add' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UniversityManagement;
