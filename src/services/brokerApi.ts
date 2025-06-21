import apiClient from '../lib/api-client';

export interface Broker {
  id: number;
  brokerage_company: string;
  agent_name: string;
  agent_phone?: string;
  agent_email?: string;
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;  createdBy?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  updatedBy?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface BrokerCreateRequest {
  brokerage_company: string;
  agent_name: string;
  agent_phone?: string;
  agent_email?: string;
}

export interface BrokerUpdateRequest {
  brokerage_company?: string;
  agent_name?: string;
  agent_phone?: string;
  agent_email?: string;
}

export interface BrokerApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export const brokerApi = {
  // Get all brokers with optional query params
  getAllBrokers: async (queryParams?: string): Promise<{ brokers: Broker[], pagination: any }> => {
    try {
      const url = queryParams ? `/brokers?${queryParams}` : '/brokers';
      const response = await apiClient.get<BrokerApiResponse<{ brokers: Broker[], pagination: any }>>(url);
      return response.data.data || { brokers: [], pagination: {} };
    } catch (error: any) {
      console.error('Error fetching brokers:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch brokers');
    }
  },

  // Get broker by ID
  getBrokerById: async (id: number): Promise<Broker> => {
    try {
      const response = await apiClient.get<BrokerApiResponse<Broker>>(`/brokers/${id}`);
      if (!response.data.data) {
        throw new Error('Broker not found');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching broker:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch broker');
    }
  },

  // Create broker
  createBroker: async (data: BrokerCreateRequest): Promise<Broker> => {
    try {
      const response = await apiClient.post<BrokerApiResponse<Broker>>('/brokers', data);
      if (!response.data.data) {
        throw new Error('Failed to create broker');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating broker:', error);
      throw new Error(error.response?.data?.message || 'Failed to create broker');
    }
  },

  // Update broker
  updateBroker: async (id: number, data: BrokerUpdateRequest): Promise<Broker> => {
    try {
      const response = await apiClient.put<BrokerApiResponse<Broker>>(`/brokers/${id}`, data);
      if (!response.data.data) {
        throw new Error('Failed to update broker');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating broker:', error);
      throw new Error(error.response?.data?.message || 'Failed to update broker');
    }
  },

  // Delete broker
  deleteBroker: async (id: number): Promise<void> => {
    try {
      await apiClient.delete<BrokerApiResponse<void>>(`/brokers/${id}`);
    } catch (error: any) {
      console.error('Error deleting broker:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete broker');
    }
  }
};
