
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
  localStorage.removeItem('token');
};
