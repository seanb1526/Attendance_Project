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