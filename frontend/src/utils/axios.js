import axios from 'axios';

// Configure axios defaults
// Use relative URLs to make it work regardless of deployment
axios.defaults.baseURL = '/';

export default axios; 