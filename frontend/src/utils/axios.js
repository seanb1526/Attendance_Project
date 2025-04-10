import axios from 'axios';

// Create a custom axios instance with baseURL
const instance = axios.create({
  // Change this to use the production URL when not in development
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000'
    : 'https://trueattend.onrender.com',
});

// Configure axios defaults
// Use relative URLs to make it work regardless of deployment
instance.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for debugging
instance.interceptors.request.use(
  config => {
    console.log('Request being sent:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

export default instance;