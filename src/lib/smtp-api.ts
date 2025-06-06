import  apiClient  from './api-client';

export interface SMTPSettings {
  id: number;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  from_email: string;
  from_name: string;
  is_default: boolean;
  is_active: boolean;
  test_email?: string;
  last_tested_at?: string;
  test_status?: 'success' | 'failed' | 'pending';
  test_error?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSMTPSettingsRequest {
  name: string;
  host: string;
  port: number;
  secure?: boolean;
  username: string;
  password: string;
  from_email: string;
  from_name?: string;
  is_default?: boolean;
}

export interface UpdateSMTPSettingsRequest extends Partial<CreateSMTPSettingsRequest> {}

export interface TestSMTPRequest {
  test_email: string;
}

export const smtpApi = {
  // Get all SMTP configurations
  getAll: async (): Promise<SMTPSettings[]> => {
    try {
      const response = await apiClient.get('/smtp-settings');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching SMTP settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch SMTP settings');
    }
  },

  // Get SMTP configuration by ID
  getById: async (id: number): Promise<SMTPSettings> => {
    try {
      const response = await apiClient.get(`/smtp-settings/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching SMTP settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch SMTP settings');
    }
  },

  // Create new SMTP configuration
  create: async (data: CreateSMTPSettingsRequest): Promise<SMTPSettings> => {
    try {
      const response = await apiClient.post('/smtp-settings', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating SMTP settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to create SMTP settings');
    }
  },

  // Update SMTP configuration
  update: async (id: number, data: UpdateSMTPSettingsRequest): Promise<SMTPSettings> => {
    try {
      const response = await apiClient.put(`/smtp-settings/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating SMTP settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to update SMTP settings');
    }
  },

  // Delete SMTP configuration
  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/smtp-settings/${id}`);
    } catch (error: any) {
      console.error('Error deleting SMTP settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete SMTP settings');
    }
  },

  // Test SMTP configuration
  test: async (id: number, data: TestSMTPRequest): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post(`/smtp-settings/${id}/test`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error testing SMTP settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to test SMTP settings');
    }
  },

  // Set as default SMTP configuration
  setDefault: async (id: number): Promise<void> => {
    try {
      await apiClient.put(`/smtp-settings/${id}/set-default`);
    } catch (error: any) {
      console.error('Error setting default SMTP settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to set default SMTP settings');
    }
  }
};
