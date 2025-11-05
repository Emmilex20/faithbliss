import axios from 'axios';

// Use the environment variable VITE_API_URL and append '/api'
const baseURL = `${import.meta.env.VITE_API_URL}/api`;

const apiClient = axios.create({
  baseURL: baseURL, // This should now be https://faithbliss.onrender.com/api
  withCredentials: true,
});

export default apiClient;