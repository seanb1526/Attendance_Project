import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AuthLanding from './components/Auth/AuthLanding';
import StudentAuth from './components/Auth/StudentAuth';
import FacultyAuth from './components/Auth/FacultyAuth';
import StudentDashboard from './components/Student/StudentDashboard';
import FacultyDashboard from './components/Faculty/FacultyDashboard';
import About from './components/About/About';
import StudentRegister from './components/Auth/StudentRegister';
import EmailVerification from './components/Auth/EmailVerification';
import StudentSignIn from './components/Auth/StudentSignIn';
import FacultyRegister from './components/Auth/FacultyRegister';
import FacultySignIn from './components/Auth/FacultySignIn';
import QRScanner from './components/Student/QRScanner';
import AttendEvent from './components/Student/AttendEvent';
import StudentProtectedRoute from './components/Auth/ProtectedRoute';

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

// Protected Route component
const ProtectedRoute = ({ children, requiredUserType = null }) => {
  if (requiredUserType === "faculty") {
    // For faculty routes, check if facultyId exists
    const isFacultyAuthenticated = localStorage.getItem('facultyId') !== null;
    
    if (!isFacultyAuthenticated) {
      // Redirect to faculty sign in
      return <Navigate to="/auth/faculty/signin" replace />;
    }
  } else if (requiredUserType === "student") {
    // For student routes, check if studentId exists
    const isStudentAuthenticated = localStorage.getItem('studentId') !== null;
    
    if (!isStudentAuthenticated) {
      // Redirect to student sign in
      return <Navigate to="/auth/student/signin" replace />;
    }
  } else {
    // For generic routes requiring authentication
    const isAuthenticated = 
      localStorage.getItem('facultyId') !== null || 
      localStorage.getItem('studentId') !== null;
    
    if (!isAuthenticated) {
      // Redirect to auth landing
      return <Navigate to="/auth" replace />;
    }
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div>
          <Routes>
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/auth/*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<AuthLanding />} />
                  <Route path="/student" element={<StudentAuth />} />
                  <Route path="/faculty" element={<FacultyAuth />} />
                  <Route path="/student/signin" element={<StudentSignIn />} />
                  <Route path="/student/register" element={<StudentRegister />} />
                  <Route path="/faculty/signin" element={<FacultySignIn />} />
                  <Route path="/faculty/register" element={<FacultyRegister />} />
                </Routes>
              </>
            } />
            <Route 
              path="/faculty/*" 
              element={
                <ProtectedRoute requiredUserType="faculty">
                  <FacultyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route
              path="*"
              element={
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route 
                      path="/student/dashboard" 
                      element={
                        <ProtectedRoute requiredUserType="student">
                          <StudentDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/scan" element={
                      <StudentProtectedRoute>
                        <QRScanner />
                      </StudentProtectedRoute>
                    } />
                    <Route path="/attend/:eventId" element={
                      <StudentProtectedRoute>
                        <AttendEvent />
                      </StudentProtectedRoute>
                    } />
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
