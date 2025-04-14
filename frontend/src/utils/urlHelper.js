/**
 * Returns the appropriate base URL based on the environment
 */
export const getBaseURL = () => {
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://trueattend.onrender.com';
};

/**
 * Creates a full API URL with the appropriate base URL for the current environment
 * @param {string} path - The API path (should start with '/')
 * @returns {string} - The complete URL
 */
export const getApiUrl = (path) => {
  return `${getBaseURL()}${path}`;
};
