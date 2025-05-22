
import axios from 'axios';
import { cookies } from 'next/headers';

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
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    const token = tokenCookie ? tokenCookie.split('=')[1].trim() : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default backendApiClient;
