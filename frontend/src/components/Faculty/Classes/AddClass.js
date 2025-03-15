import React from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';

const AddClass = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const [students, setStudents] = React.useState([]);
  const [newStudent, setNewStudent] = React.useState({
    firstName: '',
    lastName: '',
    studentId: '',
    email: ''
  });
  
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

      <Paper sx={{ 
        p: 4, 
        maxWidth: 800, 
        mx: 'auto',
        bgcolor: '#FFFFFF'
      }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Class Name"
              placeholder="e.g., Introduction to Computer Science"
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Class Code"
              placeholder="e.g., CS101"
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Section"
              placeholder="e.g., A"
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Semester"
              defaultValue=""
              required
            >
              <MenuItem value="Spring 2024">Spring 2024</MenuItem>
              <MenuItem value="Summer 2024">Summer 2024</MenuItem>
              <MenuItem value="Fall 2024">Fall 2024</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              placeholder="Enter class description..."
            />
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
      </Paper>
    </Box>
  );
};

export default AddClass;
