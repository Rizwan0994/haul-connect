
import backendApiClient from './client';

export const login = async (username: string, password: string) => {
  const response = await backendApiClient.post('/api/auth/login', {
    username,
    password
  });
  return response.data;
};

export const register = async (username: string, password: string, category: string) => {
  const response = await backendApiClient.post('/api/auth/register', {
    username,
    password,
    category
  });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
