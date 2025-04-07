import axios from 'axios';

// Configure axios defaults
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
axios.defaults.baseURL = apiUrl;

export default axios; 