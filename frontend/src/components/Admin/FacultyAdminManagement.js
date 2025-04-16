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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import axios from '../../utils/axios';

const FacultyAdminManagement = ({ adminInfo }) => {
  const [schoolsData, setSchoolsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedSchool, setExpandedSchool] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState({});
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('sub');
  const [processingPromotion, setProcessingPromotion] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Load faculty data on component mount
  useEffect(() => {
    fetchFacultyData();
  }, []);

  // Fetch faculty data grouped by school
  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      const adminId = localStorage.getItem('adminId');
      
      if (!adminId) {
        setError('You must be logged in as an administrator to view this page');
        setLoading(false);
        return;
      }

      const response = await axios.get(`/api/admin/faculty-by-school/?admin_id=${adminId}`);
      setSchoolsData(response.data);
      
      // Auto-expand if only one school
      if (response.data.length === 1) {
        setExpandedSchool(response.data[0].school_id);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching faculty data:', err);
      setError(err.response?.data?.error || 'Failed to load faculty data');
      setLoading(false);
    }
  };

  // Handle school accordion expansion
  const handleAccordionChange = (schoolId) => (event, isExpanded) => {
    setExpandedSchool(isExpanded ? schoolId : null);
  };

  // Handle faculty selection
  const handleFacultySelect = (facultyId) => {
    setSelectedFaculty(prev => ({
      ...prev,
      [facultyId]: !prev[facultyId]
    }));
  };

  // Open promote dialog
  const handleOpenPromoteDialog = () => {
    // If none selected, show error
    const selected = Object.keys(selectedFaculty).filter(id => selectedFaculty[id]);
    if (selected.length === 0) {
      setError('Please select at least one faculty member to promote');
      setSnackbarOpen(true);
      return;
    }
    
    // Check if any selected faculty is already an admin
    const schools = [...schoolsData];
    for (const school of schools) {
      for (const faculty of school.faculty) {
        if (selectedFaculty[faculty.id] && faculty.is_admin) {
          setError('One or more selected faculty members is already an administrator');
          setSnackbarOpen(true);
          return;
        }
      }
    }
    
    setPromoteDialogOpen(true);
  };

  // Handle promote to admin
  const handlePromoteFaculty = async () => {
    try {
      setProcessingPromotion(true);
      const selectedIds = Object.keys(selectedFaculty).filter(id => selectedFaculty[id]);
      const adminId = localStorage.getItem('adminId');
      
      // Process each promotion
      for (const facultyId of selectedIds) {
        try {
          await axios.post('/api/admin/promote-faculty/', {
            requester_id: adminId,
            faculty_id: facultyId,
            role: selectedRole
          });
        } catch (err) {
          console.error(`Error promoting faculty ${facultyId}:`, err);
          throw err;
        }
      }
      
      // Close dialog and show success message
      setPromoteDialogOpen(false);
      setSuccess(`Successfully promoted ${selectedIds.length} faculty member(s) to ${selectedRole === 'master' ? 'Master Admin' : selectedRole === 'co' ? 'Co-Administrator' : 'University Admin'} role`);
      setSnackbarOpen(true);
      
      // Refresh faculty data
      fetchFacultyData();
      
      // Clear selections
      setSelectedFaculty({});
      setSelectedRole('sub');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to promote faculty');
      setSnackbarOpen(true);
    } finally {
      setProcessingPromotion(false);
    }
  };

  // Get role label
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

  // Get role color
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

  // Count selected faculty
  const getSelectedCount = () => {
    return Object.values(selectedFaculty).filter(selected => selected).length;
  };

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

  if (error && !snackbarOpen) {
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
          Faculty Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<SupervisorAccountIcon />}
          onClick={handleOpenPromoteDialog}
          disabled={getSelectedCount() === 0}
          sx={{
            bgcolor: '#DEA514',
            '&:hover': {
              bgcolor: '#B88A10',
            }
          }}
        >
          Promote to Admin ({getSelectedCount()})
        </Button>
      </Box>
      
      {schoolsData.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography align="center" color="textSecondary">
            No faculty members found.
          </Typography>
        </Paper>
      ) : (
        schoolsData.map((school) => (
          <Accordion 
            key={school.school_id}
            expanded={expandedSchool === school.school_id}
            onChange={handleAccordionChange(school.school_id)}
            sx={{
              mb: 2,
              '&:before': {
                display: 'none',
              },
              boxShadow: 1
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: 'rgba(222, 165, 20, 0.05)',
                '&:hover': {
                  bgcolor: 'rgba(222, 165, 20, 0.1)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1, color: '#DEA514' }} />
                <Typography variant="h6">{school.school_name}</Typography>
                <Typography 
                  variant="body2" 
                  sx={{ ml: 2, color: 'text.secondary' }}
                >
                  ({school.faculty.length} faculty)
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox 
                          indeterminate={
                            school.faculty.some(f => selectedFaculty[f.id]) && 
                            !school.faculty.every(f => selectedFaculty[f.id])
                          }
                          checked={
                            school.faculty.length > 0 && 
                            school.faculty.every(f => selectedFaculty[f.id])
                          }
                          onChange={() => {
                            const allSelected = school.faculty.every(f => selectedFaculty[f.id]);
                            const newSelected = {...selectedFaculty};
                            
                            school.faculty.forEach(f => {
                              // Only allow selecting faculty that aren't already admins
                              if (!f.is_admin) {
                                newSelected[f.id] = !allSelected;
                              }
                            });
                            
                            setSelectedFaculty(newSelected);
                          }}
                        />
                      </TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Admin Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {school.faculty.map((faculty) => (
                      <TableRow
                        key={faculty.id}
                        hover
                        selected={selectedFaculty[faculty.id] || false}
                        sx={{
                          cursor: faculty.is_admin ? 'default' : 'pointer',
                          '&.Mui-selected, &.Mui-selected:hover': {
                            bgcolor: 'rgba(222, 165, 20, 0.1)',
                          }
                        }}
                        onClick={() => {
                          if (!faculty.is_admin) {
                            handleFacultySelect(faculty.id);
                          }
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox 
                            checked={selectedFaculty[faculty.id] || false}
                            disabled={faculty.is_admin}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleFacultySelect(faculty.id);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {faculty.first_name} {faculty.last_name}
                        </TableCell>
                        <TableCell>{faculty.email}</TableCell>
                        <TableCell>
                          {faculty.is_admin ? (
                            <Tooltip title={`This faculty member is already a ${getRoleLabel(faculty.admin_role)}`}>
                              <Chip 
                                label={getRoleLabel(faculty.admin_role)}
                                sx={{ 
                                  bgcolor: `${getRoleColor(faculty.admin_role)}22`, // Add 22 for about 13% opacity
                                  color: getRoleColor(faculty.admin_role),
                                  fontWeight: 500,
                                  borderColor: getRoleColor(faculty.admin_role)
                                }}
                                variant="outlined"
                                size="small"
                              />
                            </Tooltip>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Not an admin
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))
      )}
      
      {/* Promote Dialog */}
      <Dialog
        open={promoteDialogOpen}
        onClose={() => !processingPromotion && setPromoteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Promote Faculty to Administrator
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              You are about to promote {getSelectedCount()} faculty member(s) to administrator role.
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="admin-role-label">Administrator Role</InputLabel>
              <Select
                labelId="admin-role-label"
                value={selectedRole}
                label="Administrator Role"
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={processingPromotion || (adminInfo?.role === 'co')}
              >
                {adminInfo?.role === 'master' && (
                  <MenuItem value="co">Co-Administrator (System-wide Management)</MenuItem>
                )}
                <MenuItem value="sub">University Admin (Limited to School)</MenuItem>
              </Select>
            </FormControl>
            
            {adminInfo?.role === 'co' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                As a Co-Administrator, you can only promote faculty to University Admin role.
              </Alert>
            )}
            
            <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
              A temporary password will be generated and sent to each faculty member's email address.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPromoteDialogOpen(false)}
            disabled={processingPromotion}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePromoteFaculty}
            disabled={processingPromotion}
            sx={{
              bgcolor: '#DEA514',
              '&:hover': {
                bgcolor: '#B88A10',
              }
            }}
          >
            {processingPromotion ? <CircularProgress size={24} /> : 'Promote'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={success || error}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: success ? '#4caf50' : '#f44336',
          }
        }}
      />
    </Box>
  );
};

export default FacultyAdminManagement;
