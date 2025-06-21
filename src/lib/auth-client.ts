import apiClient from './api-client';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role_id: number;        // Role ID for permission system
  role_name: string;      // Role name for permission system
  permissions?: any[];    // User permissions
  fatherName?: string;
  address?: string;
  contact?: string;
  cnic?: string;
  experience?: string;
  department?: string;
  onboardDate?: string;
  lastLogin?: string;
  lastLoginIp?: string;
  photoUrl?: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: number;
}

export const authClient = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (data: RegisterData): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token and redirect
      localStorage.removeItem('authToken');
      window.location.href = '/auth/login';
    }
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
