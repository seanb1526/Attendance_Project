import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../../../utils/axios';

const EditClass = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Class state
  const [classData, setClassData] = useState({
    name: '',
    code: '',
    section: '',
    semester: '',
    description: '',
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
        
        // Parse metadata if available
        let metadata = {
          code: '',
          section: '',
          semester: 'Current Semester',
          description: ''
        };
        
        try {
          if (classResponse.data.description) {
            const parsedMetadata = JSON.parse(classResponse.data.description);
            metadata = { ...metadata, ...parsedMetadata };
          }
        } catch (e) {
          console.error('Error parsing class metadata:', e);
        }
        
        // Set class data
        setClassData({
          name: classResponse.data.name,
          code: metadata.code || '',
          section: metadata.section || '',
          semester: metadata.semester || 'Current Semester',
          description: metadata.description || ''
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
  }, [id]);

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
      
      if (!facultyId) {
        setError('You must be logged in to update a class');
        setOpenSnackbar(true);
        return;
      }
      
      // Prepare class metadata (for fields not in the model)
      const metadata = {
        code: classData.code,
        section: classData.section,
        semester: classData.semester,
        description: classData.description
      };
      
      // Register/lookup new students
      const schoolId = localStorage.getItem('schoolId');
      const studentIds = [];
      
      // Process each student
      for (const student of students) {
        if (student.id) {
          // If student already has an ID, they're an existing student
          studentIds.push(student.id);
        } else {
          try {
            // Check if student exists by email
            const lookupResponse = await axios.get(`/api/student/lookup/?email=${student.email}`);
            // If we get here, the student exists
            studentIds.push(lookupResponse.data.id);
          } catch (error) {
            if (error.response?.status === 404) {
              // Student doesn't exist - this is expected for new students
              // Register them without logging an error
              try {
                const registerResponse = await axios.post('/api/student/register/', {
                  first_name: student.firstName,
                  last_name: student.lastName,
                  student_id: student.studentId,
                  email: student.email,
                  school: schoolId,
                });
                
                if (registerResponse.data && registerResponse.data.student_id) {
                  studentIds.push(registerResponse.data.student_id);
                }
              } catch (registerError) {
                // This is an actual error we should log
                console.error(`Error registering student ${student.email}:`, registerError);
              }
            } else {
              // This is an actual error we should log
              console.error(`Error looking up student ${student.email}:`, error);
            }
          }
        }
      }
      
      // Prepare the payload
      const payload = {
        name: classData.name,
        description: JSON.stringify(metadata),
        faculty: facultyId,
        school: schoolId,
        students: studentIds
      };
      
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
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Class Code"
              variant="outlined"
              value={classData.code}
              onChange={handleClassDataChange('code')}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Section"
              variant="outlined"
              value={classData.section}
              onChange={handleClassDataChange('section')}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Semester"
              variant="outlined"
              value={classData.semester}
              onChange={handleClassDataChange('semester')}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description (Optional)"
              variant="outlined"
              value={classData.description}
              onChange={handleClassDataChange('description')}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
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