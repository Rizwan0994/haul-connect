import apiClient from '../lib/api-client';

// TypeScript interfaces for carrier approval workflow
export interface CarrierApprovalStatus {
  approval_status: 'pending' | 'manager_approved' | 'approved' | 'rejected';
  manager_approved_at?: string;
  accounts_approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  is_disabled: boolean;
  disabled_at?: string;
  managerApprover?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  accountsApprover?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  rejectedBy?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  disabledBy?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CarrierApprovalItem {
  id: number;
  mc_number: string;
  company_name: string;
  owner_name: string;
  phone_number: string;
  email_address: string;
  agent_name?: string;
  approval_status: 'pending' | 'manager_approved' | 'approved' | 'rejected';
  created_at: string;
  manager_approved_at?: string;
  accounts_approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  is_disabled: boolean;
  disabled_at?: string;
  managerApprover?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  accountsApprover?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  rejectedBy?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  disabledBy?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface RejectCarrierRequest {
  reason: string;
}

// Carrier Approval API Service
export const carrierApprovalApi = {
  // Get pending carriers requiring approval
  getPendingCarriers: async (status?: 'pending' | 'manager_approved' | 'approved' | 'rejected' | 'disabled'): Promise<CarrierApprovalItem[]> => {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get<ApiResponse<CarrierApprovalItem[]>>('/carrier-approvals/pending', { params });
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error fetching pending carriers:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch pending carriers');
    }
  },

  // Approve carrier as manager (first approval)
  approveAsManager: async (carrierId: number): Promise<void> => {
    try {
      const response = await apiClient.post<ApiResponse<void>>(`/carrier-approvals/${carrierId}/approve-manager`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to approve carrier as manager');
      }
    } catch (error: any) {
      console.error('Error approving carrier as manager:', error);
      throw new Error(error.response?.data?.message || 'Failed to approve carrier as manager');
    }
  },

  // Approve carrier as accounts (final approval)
  approveAsAccounts: async (carrierId: number): Promise<void> => {
    try {
      const response = await apiClient.post<ApiResponse<void>>(`/carrier-approvals/${carrierId}/approve-accounts`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to approve carrier as accounts');
      }
    } catch (error: any) {
      console.error('Error approving carrier as accounts:', error);
      throw new Error(error.response?.data?.message || 'Failed to approve carrier as accounts');
    }
  },

  // Reject carrier
  rejectCarrier: async (carrierId: number, reason: string): Promise<void> => {
    try {
      const requestData: RejectCarrierRequest = { reason };
      const response = await apiClient.post<ApiResponse<void>>(`/carrier-approvals/${carrierId}/reject`, requestData);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reject carrier');
      }
    } catch (error: any) {
      console.error('Error rejecting carrier:', error);
      throw new Error(error.response?.data?.message || 'Failed to reject carrier');
    }
  },

  // Disable carrier
  disableCarrier: async (carrierId: number): Promise<void> => {
    try {
      const response = await apiClient.post<ApiResponse<void>>(`/carrier-approvals/${carrierId}/disable`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to disable carrier');
      }
    } catch (error: any) {
      console.error('Error disabling carrier:', error);
      throw new Error(error.response?.data?.message || 'Failed to disable carrier');
    }
  },

  // Get approval status for a specific carrier
  getApprovalStatus: async (carrierId: number): Promise<CarrierApprovalStatus> => {
    try {
      const response = await apiClient.get<ApiResponse<CarrierApprovalStatus>>(`/carrier-approvals/${carrierId}/status`);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch approval status');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching approval status:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch approval status');
    }
  }
};

export default carrierApprovalApi;
