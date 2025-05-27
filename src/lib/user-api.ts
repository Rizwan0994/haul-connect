import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with auth token
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'user';
  category: 'dispatch_user' | 'sales_user' | 'sales_manager' | 'dispatch_manager' | 'accounts_user' | 'accounts_manager' | 'hr_manager' | 'hr_user' | 'admin_user' | 'admin_manager' | 'super_admin';
  basic_salary: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role?: 'admin' | 'user';
  category: User['category'];
  basic_salary?: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
  category?: User['category'];
  basic_salary?: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export const userAPI = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (id: number, userData: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // Update user status (activate/deactivate)
  updateUserStatus: async (id: number, is_active: boolean): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}/status`, { is_active });
    return response.data;
  },
};
