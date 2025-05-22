
import backendApiClient from './client';

export const login = async (username: string, password: string) => {
  const response = await backendApiClient.post('/auth/login', {
    username,
    password
  });
  return response.data;
};

export const register = async (username: string, password: string, email: string) => {
  const response = await backendApiClient.post('/auth/register', {
    username,
    password,
    email
  });
  return response.data;
};

export const logout = () => {
  // Clear the token cookie
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};
