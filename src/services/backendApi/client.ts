
import axios from 'axios';

const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

if (!backendApiUrl) {
  throw new Error('NEXT_PUBLIC_BACKEND_API_URL is not defined');
}

const backendApiClient = axios.create({
  baseURL: backendApiUrl,
});

backendApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default backendApiClient;
