import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  useTheme,
  useMediaQuery,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../../../utils/axios';

const AddClass = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  // Get current year for semester options
  const currentYear = new Date().getFullYear();
  // Create semester options
  const semesterOptions = [
    `Spring ${currentYear}`,
    `Summer ${currentYear}`,
    `Fall ${currentYear}`,
    `Winter ${currentYear}`
  ];
  
  // Class state
  const [classData, setClassData] = useState({
    name: '',
    semester: '',
  });

  // Students state
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    email: ''
  });
  
  // Notification states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split('\n');
        const parsedStudents = rows.slice(1).map(row => {
          const [firstName, lastName, studentId, email] = row.split(',');
          return { firstName, lastName, studentId, email: email?.trim() };
        }).filter(student => student.firstName);
        setStudents([...students, ...parsedStudents]);
      };
      reader.readAsText(file);
    }
  };

  const handleAddStudent = () => {
    if (newStudent.firstName && newStudent.lastName && newStudent.studentId && newStudent.email) {
      setStudents([...students, newStudent]);
      setNewStudent({ firstName: '', lastName: '', studentId: '', email: '' });
    }
  };

  const handleClassDataChange = (field) => (event) => {
    setClassData({
      ...classData,
      [field]: event.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Form validation
    if (!classData.name) {
      setError('Class name is required');
      setOpenSnackbar(true);
      return;
    }
    
    try {
      // Get faculty ID from localStorage or session
      const facultyId = localStorage.getItem('facultyId');
      const schoolId = localStorage.getItem('schoolId');
      
      if (!facultyId) {
        setError('You must be logged in to create a class');
        setOpenSnackbar(true);
        return;
      }
      
      // Process each student - use our dedicated faculty-add-student endpoint
      const studentIds = [];
      
      for (const student of students) {
        try {
          // Use our new endpoint for faculty adding students
          const addStudentResponse = await axios.post('/api/faculty/add-student/', {
            email: student.email,
            firstName: student.firstName,
            lastName: student.lastName, 
            studentId: student.studentId,
            faculty_id: facultyId,
            school_id: schoolId
          });
          
          if (addStudentResponse.data && addStudentResponse.data.id) {
            studentIds.push(addStudentResponse.data.id);
            console.log(`Added student ${student.email} with status: ${addStudentResponse.data.status}`);
          }
        } catch (error) {
          console.error(`Error processing student ${student.email}:`, error);
        }
      }
      
      // Create the class - ensure semester is sent directly
      const classResponse = await axios.post('/api/class/create/', {
        name: classData.name,
        faculty_id: facultyId,
        metadata: JSON.stringify({}), // Empty metadata since we removed those fields
        students: studentIds,
        semester: classData.semester,
        school: schoolId
      });
      
      setSuccess('Class created successfully!');
      setOpenSnackbar(true);
      
      // Reset form
      setClassData({
        name: '',
        semester: '',
      });
      setStudents([]);
      
      // Navigate back after a short delay to show success message
      setTimeout(() => {
        navigate('/faculty/classes');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating class:', error.response?.data || error);
      setError(error.response?.data?.error || 'Failed to create class. Please try again.');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4,
          color: '#2C2C2C',
          fontWeight: 'bold'
        }}
      >
        Add New Class
      </Typography>

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>

      <Paper sx={{ 
        p: 4, 
        maxWidth: 800, 
        mx: 'auto',
        bgcolor: '#FFFFFF'
      }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Class Name"
                placeholder="e.g., Introduction to Computer Science"
                required
                value={classData.name}
                onChange={handleClassDataChange('name')}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Semester"
                value={classData.semester}
                onChange={handleClassDataChange('semester')}
              >
                {semesterOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Add Students</Typography>
              
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ mr: 2 }}
                >
                  Import CSV
                  <input
                    type="file"
                    hidden
                    accept=".csv"
                    onChange={handleFileUpload}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  CSV format: firstName, lastName, studentId, email
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Student ID"
                    value={newStudent.studentId}
                    onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <Button
                    variant="contained"
                    onClick={handleAddStudent}
                    sx={{
                      height: '100%',
                      bgcolor: '#DEA514',
                      '&:hover': {
                        bgcolor: '#B88A10',
                      }
                    }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>

              {students.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Added Students ({students.length})
                  </Typography>
                  {students.map((student, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: index < students.length - 1 ? '1px solid #eee' : 'none'
                    }}>
                      <Typography>
                        {student.firstName} {student.lastName} ({student.studentId})
                      </Typography>
                      <IconButton 
                        size="small"
                        onClick={() => setStudents(students.filter((_, i) => i !== index))}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Paper>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'flex-end' 
              }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/faculty/classes')}
                  fullWidth={isMobile}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth={isMobile}
                  sx={{
                    bgcolor: '#DEA514',
                    '&:hover': {
                      bgcolor: '#B88A10',
                    }
                  }}
                >
                  Create Class
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddClass;
