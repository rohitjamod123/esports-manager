// Axios instance -> talks to the Express backend (CORS is enabled there)
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

// attach the JWT token to every request if the user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errorText = (err) => err.response?.data?.message || 'Cannot reach the server on port 5000';
export default api;
