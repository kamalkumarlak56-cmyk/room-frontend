// client/src/api/axios.js
import axios from 'axios';

// Local backend URL stored directly in code
const LOCAL_BACKEND_URL = 'http://localhost:5000/api';

// Deployed backend URL stored in .env
const DEPLOYED_BACKEND_URL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '';

/**
 * Determine the appropriate API Base URL:
 * 1. If running on localhost or 127.0.0.1, connect to the local backend (http://localhost:5000/api) by default.
 *    (Allows seamless local development without touching deployed servers)
 * 2. If running on a deployed domain (e.g. Vercel), use the deployed backend URL from .env.
 * 3. Supports an optional override: VITE_USE_DEPLOYED_API=true if user wants localhost frontend to talk to deployed backend.
 */
const getBaseURL = () => {
  const isBrowser = typeof window !== 'undefined';
  const isLocalhost =
    isBrowser &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]');

  const forceDeployed =
    import.meta.env.VITE_USE_DEPLOYED_API === 'true' ||
    import.meta.env.VITE_TARGET === 'deployed';

  let chosenUrl;
  if (isLocalhost && !forceDeployed) {
    chosenUrl = LOCAL_BACKEND_URL;
  } else if (DEPLOYED_BACKEND_URL) {
    chosenUrl = DEPLOYED_BACKEND_URL;
  } else {
    chosenUrl = LOCAL_BACKEND_URL;
  }

  // Normalize: remove trailing slash, ensure it ends with /api
  const cleaned = chosenUrl.trim().replace(/\/+$/, '');
  return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
};

const API = axios.create({
  baseURL: getBaseURL(),
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