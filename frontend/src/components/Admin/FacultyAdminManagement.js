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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import axios from '../../utils/axios';

const FacultyAdminManagement = ({ adminInfo }) => {
  const [facultyAdmins, setFacultyAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // This is just for demonstration - replace with actual API calls
  useEffect(() => {
    setTimeout(() => {
      // Mock data
      const mockFacultyAdmins = [
        { 
          id: 1, 
          faculty_id: 101, 
          name: 'Dr. John Smith', 
          email: 'jsmith@salisbury.edu', 
          university_id: 1,
          university_name: 'Salisbury University',
          role: 'sub'
        },
        { 
          id: 2, 
          faculty_id: 102, 
          name: 'Prof. Sarah Johnson', 
          email: 'sjohnson@umd.edu', 
          university_id: 2,
          university_name: 'University of Maryland',
          role: 'co'
        },
        { 
          id: 3, 
          faculty_id: 103, 
          name: 'Dr. Michael Brown', 
          email: 'mbrown@towson.edu', 
          university_id: 3,
          university_name: 'Towson University',
          role: 'sub'
        },
      ];
      
      setFacultyAdmins(mockFacultyAdmins);
      setLoading(false);
    }, 1000);
  }, []);

  // If user doesn't have permission to view or modify admin assignments
  if (adminInfo?.role === 'sub') {
    return (
      <Alert severity="warning">
        You don't have permission to manage administrator assignments. This feature is available only to master and co-administrators.
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

  const getRoleLabel = (role) => {
    switch (role) {
      case 'master':
        return 'Master Admin';
      case 'co':
        return 'Co-Admin';
      case 'sub':
        return 'University Admin';
      default:
        return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'master':
        return '#9C27B0'; // Purple
      case 'co':
        return '#2196F3'; // Blue
      case 'sub':
        return '#4CAF50'; // Green
      default:
        return '#9E9E9E'; // Grey
    }
  };

  return (
    <Box>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2C2C2C' }}>
          Faculty Administrator Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<SupervisorAccountIcon />}
          sx={{
            bgcolor: '#DEA514',
            '&:hover': {
              bgcolor: '#B88A10',
            }
          }}
        >
          Assign Administrator
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>University</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {facultyAdmins.map((admin) => (
                <TableRow 
                  hover
                  key={admin.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.university_name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getRoleLabel(admin.role)}
                      sx={{ 
                        bgcolor: `${getRoleColor(admin.role)}22`, // Add 22 for about 13% opacity
                        color: getRoleColor(admin.role),
                        fontWeight: 500,
                        borderColor: getRoleColor(admin.role)
                      }}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="delete"
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
    </Box>
  );
};

export default FacultyAdminManagement;
