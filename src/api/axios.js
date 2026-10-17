// client/src/api/axios.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL ,
});

// Attach token to headers if present in localStorage
API.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      const { token } = JSON.parse(userInfo);
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore malformed localStorage
    }
  }
  return req;
});

export default API;
