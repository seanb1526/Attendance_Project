import axios from 'axios';

// Create a custom axios instance with baseURL
const instance = axios.create({
  // Use REACT_APP_API_URL environment variable for production
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000'
    : process.env.REACT_APP_API_URL || 'https://trueattend.onrender.com',
});

// Configure axios defaults
// Use relative URLs to make it work regardless of deployment
instance.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor 
instance.interceptors.request.use(
  config => {
    // Console logs removed for production
    return config;
  },
  error => {
    // Console logs removed for production
    return Promise.reject(error);
  }
);

// Add response interceptor 
instance.interceptors.response.use(
  response => {
    // Console logs removed for production
    return response;
  },
  error => {
    // Console logs removed for production
    return Promise.reject(error);
  }
);

export default instance;