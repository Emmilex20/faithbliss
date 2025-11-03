import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend API base URL
  withCredentials: true, // This is crucial for sending/receiving cookies
});

export default apiClient;