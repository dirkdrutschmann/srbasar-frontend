import axios from 'axios';
import { getApiUrl } from '@/config/env';
import { useAuthStore } from '@/stores/auth.store';

// Axios Instanz mit Base URL
const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 2000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Fügt Auth Header hinzu
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const user = authStore.getCurrentUser();
    
    if (user && user.accessToken) {
      config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
    return config;
  },
  (error) => {
    return error;
  }
);

// Response Interceptor - Behandelt Auth-Fehler
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token ist ungültig - User ausloggen
      const authStore = useAuthStore();
      authStore.logout();
    }
    return error;
  }
);

// Auth Header Funktion für Legacy-Kompatibilität
const authHeader = () => {
  const authStore = useAuthStore();
  const user = authStore.getCurrentUser();
  
  if (user && user.accessToken) {
    return { Authorization: `Bearer ${user.accessToken}` };
  }
  return {};
};

// Funktion zum Hinzufügen von Auth Headers zu Requests
const addAuthHeader = (config) => {
  const headers = authHeader();
  if (headers.Authorization) {
    config.headers = { ...config.headers, ...headers };
  }
  return config;
};

export { apiClient, authHeader, addAuthHeader };
export default apiClient; 