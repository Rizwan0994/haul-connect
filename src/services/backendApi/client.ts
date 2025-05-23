
import axios from 'axios';

const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

if (!backendApiUrl) {
  throw new Error('NEXT_PUBLIC_BACKEND_API_URL is not defined');
}

const backendApiClient = axios.create({
  baseURL: backendApiUrl,
  withCredentials: true
});

backendApiClient.interceptors.request.use(async (config) => {
  try {
    const session = await fetch('/api/auth/session');
    const data = await session.json();
    
    if (data?.accessToken) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${data.accessToken}`
      };
    }
  } catch (error) {
    console.error('Error getting session:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default backendApiClient;
