import apiClient from '../lib/api-client';

export interface CarrierProfile {
  id?: number;
  agent_name?: string;
  mc_number?: string;
  us_dot_number?: string;
  company_name?: string;
  owner_name?: string;
  // Driver fields
  driver_name?: string;
  driver_phone?: string;
  driver_email?: string;
  driver_license_number?: string;
  driver_license_state?: string;
  driver_license_expiration?: string;
  // Contact details
  phone_number?: string;
  email_address?: string;
  address?: string;
  ein_number?: string;
  truck_type?: string;
  dock_height?: string;
  dimensions?: string;
  doors_type?: string;
  door_clearance?: string;
  accessories?: string;
  max_weight?: string;
  temp_control_range?: string;
  agreed_percentage?: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  insurance_company_name?: string;
  insurance_company_address?: string;
  insurance_agent_name?: string;
  insurance_agent_number?: string;
  insurance_agent_email?: string;
  factoring_company_name?: string;
  factoring_company_address?: string;
  factoring_agent_name?: string;
  factoring_agent_number?: string;
  factoring_agent_email?: string;
  notes_home_town?: string;
  notes_days_working?: string;
  notes_preferred_lanes?: string;
  notes_additional_preferences?: string;
  notes_parking_space?: string;  notes_average_gross?: string;
  created_at?: string;
  updated_at?: string;
  approval_status?: "pending" | "manager_approved" | "accounts_approved" | "rejected" | "disabled";  approved_by_manager?: string;
  approved_by_accounts?: string;
  manager_approved_at?: string;
  accounts_approved_at?: string;
    // Sales tracking fields
  sales_agent_id?: number;
  created_by?: number;
  commission_paid?: boolean;
  commission_paid_by?: number;
  commission_paid_at?: string;
  
  // Commission tracking fields
  commission_status?: "not_eligible" | "pending" | "paid" | "confirmed_sale";
  commission_amount?: number;
  loads_completed?: number;
  first_load_completed_at?: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export const carrierApiService = {
  // Get all carriers
  getAllCarriers: async (): Promise<CarrierProfile[]> => {
    try {
      const response = await apiClient.get<ApiResponse<CarrierProfile[]>>('/carriers');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching carriers:', error);
      throw error;
    }
  },

  // Get carrier by ID
  getCarrierById: async (id: number): Promise<CarrierProfile> => {
    try {
      const response = await apiClient.get<ApiResponse<CarrierProfile>>(`/carriers/${id}`);
      if (!response.data.data) {
        throw new Error('Carrier not found');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching carrier:', error);
      throw error;
    }
  },

  // Create new carrier
  createCarrier: async (carrierData: Omit<CarrierProfile, 'id' | 'created_at' | 'updated_at'>): Promise<CarrierProfile> => {
    try {
      const response = await apiClient.post<ApiResponse<CarrierProfile>>('/carriers', carrierData);
      if (!response.data.data) {
        throw new Error('Failed to create carrier');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error creating carrier:', error);
      throw error;
    }
  },

  // Update carrier
  updateCarrier: async (id: number, carrierData: Partial<CarrierProfile>): Promise<CarrierProfile> => {
    try {
      const response = await apiClient.put<ApiResponse<CarrierProfile>>(`/carriers/${id}`, carrierData);
      if (!response.data.data) {
        throw new Error('Failed to update carrier');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error updating carrier:', error);
      throw error;
    }
  },

  // Delete carrier
  deleteCarrier: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/carriers/${id}`);
    } catch (error) {
      console.error('Error deleting carrier:', error);
      throw error;
    }
  },
};
