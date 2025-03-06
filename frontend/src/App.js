import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AuthLanding from './components/Auth/AuthLanding';
import StudentDashboard from './components/Student/StudentDashboard';
import FacultyDashboard from './components/Faculty/FacultyDashboard';

// Create a theme instance with our color scheme
const theme = createTheme({
  palette: {
    primary: {
      main: '#DEA514', // New Saffron for CTAs and important buttons
      dark: '#B88A10', // Darker shade of new Saffron for hover states (20% darker)
    },
    secondary: {
      main: '#FFD700', // Gold
      dark: '#E6C200', // Darker gold for hover states
    },
    background: {
      default: '#FFFFFF', // White main background
      paper: '#F5F5DC', // Soft Beige for cards and sections
    },
    text: {
      primary: '#2C2C2C', // Dark gray for better readability
      secondary: '#B88A10', // Darker Saffron for secondary text
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#DEA514',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#B88A10',
          },
        },
        outlined: {
          borderColor: '#DEA514',
          color: '#DEA514',
          '&:hover': {
            borderColor: '#B88A10',
            color: '#B88A10',
            backgroundColor: 'rgba(222, 165, 20, 0.04)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#D66E00',
    },
    h2: {
      color: '#FF8C00',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div>
          <Routes>
            <Route path="/faculty/*" element={<FacultyDashboard />} />
            <Route
              path="*"
              element={
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/auth" element={<AuthLanding />} />
                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                  </Routes>
                </>
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
