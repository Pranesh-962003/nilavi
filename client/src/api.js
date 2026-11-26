import axios from 'axios';
import { getAdminToken } from './lib/api';

export const Api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:2004/api',
  withCredentials: true
});

// Automatically inject Bearer authentication token into outgoing requests
Api.interceptors.request.use(
  (config) => {
    const token = getAdminToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default Api;
