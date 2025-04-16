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
  Tooltip,
  Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import axios from '../../utils/axios';

const AdminManagement = ({ adminInfo }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [processing, setProcessing] = useState(false);
  const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false);
  const [adminToRevoke, setAdminToRevoke] = useState(null);

  // Load admin data on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  // Fetch admins from API
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const adminId = localStorage.getItem('adminId');
      
      if (!adminId) {
        setError('You must be logged in as an administrator to view this page');
        setLoading(false);
        return;
      }

      const response = await axios.get(`/api/admins/`);
      setAdmins(response.data.filter(admin => admin.role !== 'revoked'));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.response?.data?.error || 'Failed to load administrator data');
      setLoading(false);
    }
  };

  // Open edit role dialog
  const handleOpenEditDialog = (admin) => {
    setSelectedAdmin(admin);
    setNewRole(admin.role);
    setEditDialogOpen(true);
  };

  // Open revoke confirmation dialog
  const handleOpenRevokeDialog = (admin) => {
    setAdminToRevoke(admin);
    setConfirmRevokeOpen(true);
  };

  // Handle updating an admin's role
  const handleUpdateRole = async () => {
    if (!selectedAdmin) return;
    
    setProcessing(true);
    try {
      const requesterId = localStorage.getItem('adminId');
      
      const response = await axios.put('/api/admin/update-role/', {
        requester_id: requesterId,
        admin_id: selectedAdmin.id,
        new_role: newRole
      });
      
      setSuccess(`Successfully updated ${selectedAdmin.first_name} ${selectedAdmin.last_name}'s role to ${getRoleLabel(newRole)}`);
      setSnackbarOpen(true);
      setEditDialogOpen(false);
      
      // Update local state
      setAdmins(prevAdmins => prevAdmins.map(admin => 
        admin.id === selectedAdmin.id ? {...admin, role: newRole} : admin
      ));
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update administrator role');
      setSnackbarOpen(true);
    } finally {
      setProcessing(false);
    }
  };

  // Handle revoking admin privileges
  const handleRevokeAdmin = async () => {
    if (!adminToRevoke) return;
    
    setProcessing(true);
    try {
      const requesterId = localStorage.getItem('adminId');
      
      await axios.put('/api/admin/update-role/', {
        requester_id: requesterId,
        admin_id: adminToRevoke.id,
        new_role: 'revoke'
      });
      
      setSuccess(`Successfully revoked administrator privileges for ${adminToRevoke.first_name} ${adminToRevoke.last_name}`);
      setSnackbarOpen(true);
      setConfirmRevokeOpen(false);
      
      // Remove from local state
      setAdmins(prevAdmins => prevAdmins.filter(admin => admin.id !== adminToRevoke.id));
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to revoke administrator privileges');
      setSnackbarOpen(true);
    } finally {
      setProcessing(false);
    }
  };

  // Get role label for display
  const getRoleLabel = (role) => {
    switch (role) {
      case 'master':
        return 'Master Admin';
      case 'co':
        return 'Co-Administrator';
      case 'sub':
        return 'University Admin';
      default:
        return role;
    }
  };

  // Get role color for display
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

  // Close snackbar when clicking away
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError('');
    setSuccess('');
  };

  // Check if user has permission to edit this admin
  const canEditAdmin = (admin) => {
    // Master admins can edit anyone
    if (adminInfo?.role === 'master') return true;
    
    // Co-admins can only edit sub-admins
    if (adminInfo?.role === 'co' && admin.role === 'sub') return true;
    
    return false;
  };

  // If user doesn't have permission to view or modify admin assignments
  if (adminInfo?.role === 'sub') {
    return (
      <Alert severity="warning">
        You don't have permission to manage administrators. This feature is available only to master and co-administrators.
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
          Administrator Management
        </Typography>
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
              {admins.length > 0 ? (
                admins.map((admin) => (
                  <TableRow 
                    hover
                    key={admin.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{admin.first_name} {admin.last_name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.school_name || 'System-wide'}</TableCell>
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
                      {canEditAdmin(admin) && (
                        <>
                          <Tooltip title="Edit Role">
                            <IconButton 
                              aria-label="edit"
                              onClick={() => handleOpenEditDialog(admin)}
                              disabled={admin.id === adminInfo.id} // Can't edit yourself
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Revoke Admin">
                            <IconButton 
                              aria-label="revoke"
                              onClick={() => handleOpenRevokeDialog(admin)}
                              disabled={admin.id === adminInfo.id} // Can't revoke yourself
                              sx={{
                                '&:hover': { color: 'error.main' }
                              }}
                            >
                              <PersonOffIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      
                      {admin.id === adminInfo.id && (
                        <Typography variant="caption" color="text.secondary">
                          (You)
                        </Typography>
                      )}
                      
                      {!canEditAdmin(admin) && admin.id !== adminInfo.id && (
                        <Typography variant="caption" color="text.secondary">
                          (No permission)
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      No administrators found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Edit Role Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => !processing && setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Update Administrator Role
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedAdmin && (
            <Box>
              <Typography gutterBottom>
                You are updating the role for <strong>{selectedAdmin.first_name} {selectedAdmin.last_name}</strong>.
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  value={newRole}
                  label="Role"
                  onChange={(e) => setNewRole(e.target.value)}
                  disabled={processing}
                >
                  {/* Only master admins can set co-admin role */}
                  {adminInfo?.role === 'master' && (
                    <MenuItem value="co">Co-Administrator (System-wide Management)</MenuItem>
                  )}
                  
                  {/* Both master and co-admins can set sub-admin role */}
                  <MenuItem value="sub">University Admin (Limited to School)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialogOpen(false)} 
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateRole}
            variant="contained"
            disabled={processing || newRole === selectedAdmin?.role}
            sx={{
              bgcolor: '#DEA514',
              '&:hover': {
                bgcolor: '#B88A10',
              }
            }}
          >
            {processing ? <CircularProgress size={24} /> : 'Update Role'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Revoke Confirmation Dialog */}
      <Dialog
        open={confirmRevokeOpen}
        onClose={() => !processing && setConfirmRevokeOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>
          Revoke Administrator Privileges
        </DialogTitle>
        <DialogContent>
          {adminToRevoke && (
            <Box sx={{ mt: 1 }}>
              <Typography gutterBottom variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to revoke administrator privileges for 
                <strong> {adminToRevoke.first_name} {adminToRevoke.last_name}</strong>?
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                This action will remove their administrator access, but can be reversed
                by promoting them again in the future.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmRevokeOpen(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRevokeAdmin}
            color="error"
            variant="contained"
            disabled={processing}
          >
            {processing ? <CircularProgress size={24} /> : 'Revoke Access'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminManagement;
