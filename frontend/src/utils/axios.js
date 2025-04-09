import axios from 'axios';

// Configure axios defaults
// Use relative URLs to make it work regardless of deployment
axios.defaults.baseURL = '/';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for debugging
axios.interceptors.request.use(
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

export default axios;