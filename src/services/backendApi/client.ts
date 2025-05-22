
import axios from 'axios';

const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

if (!backendApiUrl) {
  throw new Error('NEXT_PUBLIC_BACKEND_API_URL is not defined');
}

const backendApiClient = axios.create({
  baseURL: backendApiUrl,
});

backendApiClient.interceptors.request.use((config) => {
  // Check if we're on the client side
  if (typeof window !== 'undefined') {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default backendApiClient;
