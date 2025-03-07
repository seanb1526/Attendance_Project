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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AddClass = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

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
