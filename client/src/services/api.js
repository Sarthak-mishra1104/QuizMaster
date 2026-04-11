/**
 * API Service - Axios instance with auth headers
 */
import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`,
  withCredentials: true,
  timeout: 30000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('qm_token');
      localStorage.removeItem('qm_userId');
      // Don't redirect here - let components handle it
    }
    return Promise.reject(err);
  }
);

export default api;
