import apiClient from '../lib/api-client';

export interface Dispatch {
  id: string;
  carrier_id: string;
  load_no: string;
  pickup_date: string;
  dropoff_date: string;
  origin: string;
  destination: string;
  status: 'Scheduled' | 'In Transit' | 'Delivered' | 'Cancelled';
  load_amount: string;
  created_at?: string;
  updated_at?: string;
  broker_id?: string;
  broker_name?: string;
  broker_contact?: string;
  customer_id?: string;
  customer_name?: string;
  commodity?: string;
  special_instructions?: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export const dispatchApiService = {
  // Get all dispatches
  getAllDispatches: async (): Promise<Dispatch[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Dispatch[]>>('/dispatches');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching dispatches:', error);
      throw error;
    }
  },

  // Get dispatches by carrier ID
  getDispatchesByCarrier: async (carrierId: string): Promise<Dispatch[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Dispatch[]>>(`/dispatches?carrier_id=${carrierId}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching dispatches for carrier ${carrierId}:`, error);
      throw error;
    }
  },

  // Get dispatch by ID
  getDispatchById: async (id: string): Promise<Dispatch> => {
    try {
      const response = await apiClient.get<ApiResponse<Dispatch>>(`/dispatches/${id}`);
      if (!response.data.data) {
        throw new Error('Dispatch not found');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dispatch:', error);
      throw error;
    }
  },

  // Create new dispatch
  createDispatch: async (dispatchData: Omit<Dispatch, 'id' | 'created_at' | 'updated_at'>): Promise<Dispatch> => {
    try {
      const response = await apiClient.post<ApiResponse<Dispatch>>('/dispatches', dispatchData);
      if (!response.data.data) {
        throw new Error('Failed to create dispatch');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error creating dispatch:', error);
      throw error;
    }
  },

  // Update dispatch
  updateDispatch: async (id: string, dispatchData: Partial<Dispatch>): Promise<Dispatch> => {
    try {
      const response = await apiClient.put<ApiResponse<Dispatch>>(`/dispatches/${id}`, dispatchData);
      if (!response.data.data) {
        throw new Error('Failed to update dispatch');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error updating dispatch:', error);
      throw error;
    }
  },

  // Delete dispatch
  deleteDispatch: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/dispatches/${id}`);
    } catch (error) {
      console.error('Error deleting dispatch:', error);
      throw error;
    }
  }
};
