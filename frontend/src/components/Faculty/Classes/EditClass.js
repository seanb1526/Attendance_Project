import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../../../utils/axios';

const EditClass = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Get current year for semester options - moved outside of render cycle
  const currentYear = new Date().getFullYear();
  // Create semester options using useMemo to prevent recreation on each render
  const semesterOptions = useMemo(() => [
    `Spring ${currentYear}`,
    `Summer ${currentYear}`,
    `Fall ${currentYear}`,
    `Winter ${currentYear}`
  ], [currentYear]);
  
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
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        // Fetch the class data
        const classResponse = await axios.get(`/api/classes/${id}/`);
        
        // Set class data - use semester directly from the response
        setClassData({
          name: classResponse.data.name,
          semester: classResponse.data.semester || semesterOptions[0], // Get semester directly from API response
        });
        
        // Fetch students enrolled in this class
        if (Array.isArray(classResponse.data.students) && classResponse.data.students.length > 0) {
          const studentPromises = classResponse.data.students.map(studentId => 
            axios.get(`/api/students/${studentId}/`)
          );
          
          try {
            const studentResponses = await Promise.all(studentPromises);
            const formattedStudents = studentResponses.map(res => ({
              id: res.data.id,
              firstName: res.data.first_name,
              lastName: res.data.last_name,
              studentId: res.data.student_id,
              email: res.data.email
            }));
            setStudents(formattedStudents);
          } catch (studentError) {
            console.error('Error fetching students:', studentError);
            setStudents([]);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching class details:', err);
        setError('Failed to load class details. Please try again.');
        setLoading(false);
      }
    };
    
    fetchClassDetails();
  }, [id]); // Removed semesterOptions from dependency array since it's now memoized

  const handleClassDataChange = (field) => (event) => {
    setClassData({
      ...classData,
      [field]: event.target.value
    });
  };

  const handleNewStudentChange = (field) => (event) => {
    setNewStudent({
      ...newStudent,
      [field]: event.target.value
    });
  };

  const handleAddStudent = () => {
    if (newStudent.firstName && newStudent.lastName && newStudent.studentId && newStudent.email) {
      setStudents([...students, { ...newStudent }]);
      setNewStudent({ firstName: '', lastName: '', studentId: '', email: '' });
    }
  };

  const handleRemoveStudent = (index) => {
    const updatedStudents = [...students];
    updatedStudents.splice(index, 1);
    setStudents(updatedStudents);
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
      // Get faculty ID from localStorage
      const facultyId = localStorage.getItem('facultyId');
      const schoolId = localStorage.getItem('schoolId');
      
      if (!facultyId) {
        setError('You must be logged in to update a class');
        setOpenSnackbar(true);
        return;
      }
      
      // Process each student - use our dedicated faculty-add-student endpoint
      const studentIds = [];
      
      for (const student of students) {
        if (student.id) {
          // If student already has an ID, they're an existing student
          studentIds.push(student.id);
        } else {
          try {
            // Use the new faculty-add-student endpoint which always creates/updates pending students
            // Pass the class ID to immediately associate the student with the class
            const addStudentResponse = await axios.post('/api/faculty/add-student/', {
              email: student.email,
              firstName: student.firstName,
              lastName: student.lastName,
              studentId: student.studentId,
              faculty_id: facultyId,
              school_id: schoolId,
              class_id: id  // Pass the class ID directly so backend can create ClassStudent entry
            });
            
            if (addStudentResponse.data && addStudentResponse.data.id) {
              studentIds.push(addStudentResponse.data.id);
              console.log(`Added student ${student.email} with status: ${addStudentResponse.data.status}`);
            }
          } catch (error) {
            console.error(`Error processing student ${student.email}:`, error);
          }
        }
      }
      
      // Prepare the payload - include semester field directly
      const payload = {
        name: classData.name,
        description: JSON.stringify({}), // Empty metadata since we removed those fields
        faculty: facultyId,
        school: schoolId,
        students: studentIds,
        semester: classData.semester // Include semester directly in the payload
      };
      
      console.log("Updating class with payload:", payload);
      
      // Update the class
      const classResponse = await axios.put(`/api/class/${id}/update/`, payload);
      
      setSuccess('Class updated successfully!');
      setOpenSnackbar(true);
      
      // Navigate back after a short delay to show success message
      setTimeout(() => {
        navigate(`/faculty/classes/${id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error updating class:', error);
      setError(error.response?.data?.error || 'Failed to update class. Please try again.');
      setOpenSnackbar(true);
    }
  };

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#DEA514' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#2C2C2C',
            fontWeight: 'bold'
          }}
        >
          Edit Class
        </Typography>
      </Box>
      
      <Paper 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          p: 3, 
          bgcolor: '#FFFFFF',
          mb: 4
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: '#2C2C2C' }}>Class Details</Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Class Name"
              variant="outlined"
              value={classData.name}
              onChange={handleClassDataChange('name')}
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Semester"
              variant="outlined"
              value={classData.semester || semesterOptions[0]}
              onChange={handleClassDataChange('semester')}
              sx={{ mb: 2 }}
            >
              {semesterOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper 
        sx={{ 
          p: 3, 
          bgcolor: '#FFFFFF',
          mb: 4
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: '#2C2C2C' }}>
          Students ({students.length})
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="raised-button-file"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="raised-button-file">
            <Button
              variant="outlined"
              component="span"
              sx={{
                borderColor: '#DEA514',
                color: '#DEA514',
                '&:hover': {
                  borderColor: '#B88A10',
                  color: '#B88A10',
                }
              }}
            >
              Import Students (CSV)
            </Button>
          </label>
          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
            CSV Format: FirstName,LastName,StudentID,Email
          </Typography>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="First Name"
              variant="outlined"
              value={newStudent.firstName}
              onChange={handleNewStudentChange('firstName')}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Last Name"
              variant="outlined"
              value={newStudent.lastName}
              onChange={handleNewStudentChange('lastName')}
            />
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Student ID"
              variant="outlined"
              value={newStudent.studentId}
              onChange={handleNewStudentChange('studentId')}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              type="email"
              value={newStudent.email}
              onChange={handleNewStudentChange('email')}
            />
          </Grid>
          
          <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleAddStudent}
              sx={{
                bgcolor: '#DEA514',
                '&:hover': {
                  bgcolor: '#B88A10',
                },
                height: '56px'
              }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
        
        {students.length > 0 ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Student List
            </Typography>
            
            {students.map((student, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  mb: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: 1,
                  bgcolor: '#f8f8f8',
                }}
              >
                <Box>
                  <Typography variant="body2">
                    <strong>{student.firstName} {student.lastName}</strong> ({student.studentId})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {student.email}
                  </Typography>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={() => handleRemoveStudent(index)}
                  aria-label="remove student"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Paper>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            No students added yet. Add students using the form above.
          </Typography>
        )}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/faculty/classes/${id}`)}
          sx={{
            borderColor: '#6c757d',
            color: '#6c757d',
            '&:hover': {
              borderColor: '#5a6268',
              color: '#5a6268',
            }
          }}
        >
          Cancel
        </Button>
        
        <Button
          variant="contained"
          type="submit"
          onClick={handleSubmit}
          sx={{
            bgcolor: '#DEA514',
            '&:hover': {
              bgcolor: '#B88A10',
            }
          }}
        >
          Save Changes
        </Button>
      </Box>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditClass;