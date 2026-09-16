// client/src/api/axios.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://room-backend-b5n8.vercel.app/api',
});

// Attach token to headers if present in localStorage
API.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;