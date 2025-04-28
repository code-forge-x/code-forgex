// client/src/services/authService.js
import axios from 'axios';

/**
 * Authentication Service
 * Handles API calls related to authentication
 */
const authService = {
  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User data and token
   */
  login: async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - User data and token
   */
  register: async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  /**
   * Log out a user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      // If your API requires a logout endpoint
      // await axios.post('/api/auth/logout');
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Remove auth header from future requests
      delete axios.defaults.headers.common['x-auth-token'];
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  /**
   * Verify if the token is valid
   * @returns {Promise<Object>} - Verification result with user data
   */
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await axios.get('/api/auth/verify', {
        headers: {
          'x-auth-token': token
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  },
  
  /**
   * Set the authentication token for all future requests
   * @param {string} token - JWT token
   */
  setAuthToken: (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  },
  
  /**
   * Get the current token from localStorage
   * @returns {string|null} - JWT token or null
   */
  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;