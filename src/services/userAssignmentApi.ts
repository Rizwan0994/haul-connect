import apiClient from '../lib/api-client';

export interface AssignedUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
  category?: string;
  assigned_at: string;
  assigned_by?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface AssignUsersRequest {
  userIds: number[];
}

export interface AssignUsersResponse {
  assignedCount: number;
  skippedCount: number;
}

export const userAssignmentApi = {
  // Get assigned users for a carrier
  getCarrierUsers: async (carrierId: string): Promise<AssignedUser[]> => {
    try {
      const response = await apiClient.get<ApiResponse<AssignedUser[]>>(`/carriers/${carrierId}/users`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching carrier users:', error);
      throw error;
    }
  },

  // Assign users to a carrier
  assignUsersToCarrier: async (carrierId: string, userIds: number[]): Promise<AssignUsersResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<AssignUsersResponse>>(`/carriers/${carrierId}/users`, {
        userIds
      });
      return response.data.data || { assignedCount: 0, skippedCount: 0 };
    } catch (error) {
      console.error('Error assigning users to carrier:', error);
      throw error;
    }
  },

  // Remove user from carrier
  removeUserFromCarrier: async (carrierId: string, userId: number): Promise<void> => {
    try {
      await apiClient.delete(`/carriers/${carrierId}/users/${userId}`);
    } catch (error) {
      console.error('Error removing user from carrier:', error);
      throw error;
    }
  }
};
