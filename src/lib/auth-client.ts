import apiClient from './api-client';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  role: string;           // Legacy role field
  category: string;       // Legacy category field
  role_id?: number;       // New role ID for permission system
  role_name?: string;     // New role name for permission system
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
  username: string;
  password: string;
  email: string;
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
