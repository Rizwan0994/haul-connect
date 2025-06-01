import axios from 'axios';

// Initialize the API client with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api'
});

// Add token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export interface Permission {
  id: number;
  name: string;
  type: 'feature' | 'route' | 'column';
  module: string;
  resource: string;
  action: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  description: string | null;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
}

export const roleAPI = {
  // Get all roles
  getAllRoles: async (): Promise<Role[]> => {
    const response = await api.get('/roles');
    return response.data.data || response.data;
  },

  // Get a role by ID
  getRoleById: async (id: number): Promise<Role> => {
    const response = await api.get(`/roles/${id}`);
    return response.data.data || response.data;
  },
  // Create a new role
  createRole: async (roleData: { name: string; description?: string; permissions?: number[] }): Promise<Role> => {
    const response = await api.post('/roles', roleData);
    return response.data.data || response.data;
  },

  // Update a role
  updateRole: async (id: number, roleData: { name?: string; description?: string; permissions?: number[] }): Promise<Role> => {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data.data || response.data;
  },

  // Delete a role
  deleteRole: async (id: number): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },
  // Get role permissions
  getRolePermissions: async (id: number): Promise<Permission[]> => {
    const response = await api.get(`/roles/${id}/permissions`);
    return response.data.data || response.data;
  },
  // Update role permissions
  updateRolePermissions: async (id: number, permissions: number[]): Promise<Role> => {
    const response = await api.put(`/roles/${id}/permissions`, { permissions });
    return response.data.data || response.data;
  },
  // Add a permission to a role
  addPermissionToRole: async (roleId: number, permissionId: number): Promise<Role> => {
    const response = await api.post(`/roles/${roleId}/permissions`, { permission_id: permissionId });
    return response.data.data || response.data;
  },

  // Remove a permission from a role
  removePermissionFromRole: async (roleId: number, permissionId: number): Promise<Role> => {
    const response = await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
    return response.data.data || response.data;
  }
};

export const permissionAPI = {
  // Get all permissions
  getAllPermissions: async (filters?: { type?: string; module?: string }): Promise<Permission[]> => {
    const response = await api.get('/permissions', { params: filters });
    return response.data.data || response.data;
  },

  // Get a permission by ID
  getPermissionById: async (id: number): Promise<Permission> => {
    const response = await api.get(`/permissions/${id}`);
    return response.data.data || response.data;
  },
  // Create a new permission
  createPermission: async (permissionData: {
    name: string;
    type: string;
    module: string;
    resource: string;
    action: string;
    description?: string;
  }): Promise<Permission> => {
    const response = await api.post('/permissions', permissionData);
    return response.data.data || response.data;
  },

  // Update a permission (only description can be updated)
  updatePermission: async (id: number, description: string): Promise<Permission> => {
    const response = await api.put(`/permissions/${id}`, { description });
    return response.data.data || response.data;
  },
  // Get all unique permission modules
  getPermissionModules: async (): Promise<string[]> => {
    const response = await api.get('/permissions/modules/list');
    return response.data.data || response.data;
  },

  // Get all unique permission types
  getPermissionTypes: async (): Promise<string[]> => {
    const response = await api.get('/permissions/types/list');
    return response.data.data || response.data;
  }
};
