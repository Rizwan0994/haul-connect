import api from '../lib/api-client';

export interface DispatchApprovalHistoryItem {
  id: number;
  dispatch_id: number;
  action: 'created' | 'manager_approved' | 'accounts_approved' | 'rejected' | 'disabled' | 'enabled';
  action_by: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  action_at: string;
  notes?: string;
  rejection_reason?: string;
  dispatch: {
    id: number;
    load_no: string;
    carrier?: {
      id: number;
      company_name: string;
      mc_number: string;
    };
  };
}

export interface DispatchApproval {
  id: number;
  load_no: string;
  approval_status: 'pending' | 'manager_approved' | 'accounts_approved' | 'rejected' | 'disabled';
  is_disabled: boolean;
  manager_approved_at?: string;
  accounts_approved_at?: string;
  rejected_at?: string;
  disabled_at?: string;
  rejection_reason?: string;
  managerApprover?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  accountsApprover?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  rejectedBy?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  disabledBy?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  carrier?: {
    id: number;
    company_name: string;
    mc_number: string;
    owner_name: string;
  };
}

export const dispatchApprovalAPI = {
  // Get pending dispatches for approval
  getPendingDispatches: async (): Promise<DispatchApproval[]> => {
    const response = await api.get('/dispatch-approvals/pending');
    return response.data.data;
  },

  // Manager approval
  approveAsManager: async (dispatchId: number): Promise<DispatchApproval> => {
    const response = await api.post(`/dispatch-approvals/${dispatchId}/approve/manager`);
    return response.data.data;
  },

  // Accounts approval
  approveAsAccounts: async (dispatchId: number): Promise<DispatchApproval> => {
    const response = await api.post(`/dispatch-approvals/${dispatchId}/approve/accounts`);
    return response.data.data;
  },

  // Reject dispatch
  rejectDispatch: async (dispatchId: number, reason: string): Promise<DispatchApproval> => {
    const response = await api.post(`/dispatch-approvals/${dispatchId}/reject`, { reason });
    return response.data.data;
  },

  // Disable dispatch
  disableDispatch: async (dispatchId: number): Promise<DispatchApproval> => {
    const response = await api.post(`/dispatch-approvals/${dispatchId}/disable`);
    return response.data.data;
  },

  // Get approval status for a specific dispatch
  getApprovalStatus: async (dispatchId: number): Promise<DispatchApproval> => {
    const response = await api.get(`/dispatch-approvals/${dispatchId}/status`);
    return response.data.data;
  },

  // Get approval history for all dispatches
  getApprovalHistory: async (): Promise<DispatchApprovalHistoryItem[]> => {
    const response = await api.get('/dispatch-approvals/history');
    return response.data.data;
  },
};
