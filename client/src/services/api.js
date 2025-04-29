import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Change this line to match what your backend expects
      config.headers['x-auth-token'] = token;
      // You can keep the Authorization header too if needed
      // config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add authentication functions
export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

export const verifyToken = async () => {
  const response = await api.get('/api/auth/verify');
  return response.data;
};

export default api;