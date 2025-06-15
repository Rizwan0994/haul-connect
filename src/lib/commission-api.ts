import apiClient from './api-client';

export interface CommissionUpdateRequest {
  commission_status?: 'not_eligible' | 'pending' | 'confirmed_sale' | 'paid';
  commission_amount?: number;
  loads_completed?: number;
  first_load_completed_at?: string;
  sales_agent_id?: number;
}

export interface LoadCompletionRequest {
  load_number?: string;
  completed_at?: string;
}

export interface CommissionSummary {
  not_eligible: { count: number; amount: number };
  pending: { count: number; amount: number };
  confirmed_sale: { count: number; amount: number };
  paid: { count: number; amount: number };
}

export const commissionApi = {
  // Update commission status for a carrier
  updateCommissionStatus: async (carrierId: string, data: CommissionUpdateRequest): Promise<any> => {
    try {
      const response = await apiClient.put(`/carriers/${carrierId}/commission`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating commission status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update commission status');
    }
  },

  // Mark a load as completed for commission tracking
  markLoadCompleted: async (carrierId: string, data: LoadCompletionRequest): Promise<any> => {
    try {
      const response = await apiClient.post(`/carriers/${carrierId}/load-completed`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error marking load as completed:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark load as completed');
    }
  },

  // Get commission summary across all carriers
  getCommissionSummary: async (): Promise<CommissionSummary> => {
    try {
      const response = await apiClient.get('/carriers/commission/summary');
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting commission summary:', error);
      throw new Error(error.response?.data?.message || 'Failed to get commission summary');
    }
  }
};
