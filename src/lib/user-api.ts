import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_PUBLIC_BACKEND_API_URL||'http://localhost:5000/api';

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
  role: 'Admin' | 'Super Admin' | 'Dispatch' | 'Sales' | 'Account' | 'Manager';  // Legacy role
  category: 'Admin' | 'Super Admin' | 'Dispatch' | 'Sales' | 'Account' | 'Manager'; // Legacy category
  role_id?: number;  // New role ID for permission system
  role_name?: string; // New role name for permission system
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
  role?: 'Admin' | 'Super Admin' | 'Dispatch' | 'Sales' | 'Account' | 'Manager';  // Legacy role
  category: User['category'];  // Legacy category
  role_id?: number;  // New role ID from permission system
  basic_salary?: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  role?: 'Admin' | 'Super Admin' | 'Dispatch' | 'Sales' | 'Account' | 'Manager';  // Legacy role
  category?: User['category'];  // Legacy category
  role_id?: number;  // New role ID from permission system
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
