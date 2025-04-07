import axios from 'axios';

// Configure axios defaults
// Use relative URLs to make requests go to the same domain
axios.defaults.baseURL = '/api';

export default axios; 