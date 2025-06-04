import apiClient from "./api-client";

// TypeScript interfaces for Dispatch data
export interface DispatchFormData {
  user: string;
  department: string;
  booking_date: string | Date;
  load_no: string;
  pickup_date: string | Date;
  dropoff_date: string | Date;
  carrier: string; // This is carrier_id in the backend
  origin: string;
  destination: string;
  brokerage_company: string;
  brokerage_agent: string;
  agent_ph: string;
  agent_email: string;
  load_amount: number;
  charge_percent: number;
  status: "Scheduled" | "In Transit" | "Delivered" | "Cancelled";
  payment: string;
  dispatcher: string;
  invoice_status: "Not Sent" | "Invoice Sent" | "Invoice Pending" | "Invoice Cleared";
  payment_method: "ACH" | "ZELLE" | "OTHER";
}

export interface Dispatch extends DispatchFormData {
  id: number;
  user_id: number;
  carrier_id: number;
  created_at: string;
  updated_at: string;
  approval_status?: "pending" | "manager_approved" | "accounts_approved" | "rejected" | "disabled";
  approved_by_manager?: number;
  approved_by_accounts?: number;
  manager_approved_at?: string;
  accounts_approved_at?: string;
  carrier?: {
    id: number;
    company_name: string;
    mc_number: string;
    owner_name: string;
    phone_number: string;
    email_address: string;
    truck_type: string;
    status: "active" | "inactive" | "pending" | "suspended";
  };
  user_details?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateDispatchRequest {
  department: string;
  booking_date: string;
  load_no: string;
  pickup_date: string;
  dropoff_date: string;
  carrier_id: number;
  origin: string;
  destination: string;
  brokerage_company: string;
  brokerage_agent: string;
  agent_ph: string;
  agent_email: string;
  load_amount: number;
  charge_percent: number;
  status: "Scheduled" | "In Transit" | "Delivered" | "Cancelled";
  payment: string;
  dispatcher: string;
  invoice_status: "Not Sent" | "Invoice Sent" | "Invoice Pending" | "Invoice Cleared";
  payment_method: "ACH" | "ZELLE" | "OTHER";
}

export interface UpdateDispatchRequest extends Partial<CreateDispatchRequest> {}

// API functions
export const dispatchAPI = {
  // Get all dispatches
  getAllDispatches: async (): Promise<Dispatch[]> => {
    try {
      const response = await apiClient.get("/dispatches");
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching dispatches:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch dispatches");
    }
  },

  // Get dispatch by ID
  getDispatchById: async (id: number): Promise<Dispatch> => {
    try {
      const response = await apiClient.get(`/dispatches/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching dispatch:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch dispatch");
    }
  },

  // Create new dispatch
  createDispatch: async (data: CreateDispatchRequest): Promise<Dispatch> => {
    try {
      const response = await apiClient.post("/dispatches", data);
      return response.data.data;
    } catch (error: any) {
      console.error("Error creating dispatch:", error);
      throw new Error(error.response?.data?.message || "Failed to create dispatch");
    }
  },

  // Update dispatch
  updateDispatch: async (id: number, data: UpdateDispatchRequest): Promise<Dispatch> => {
    try {
      const response = await apiClient.put(`/dispatches/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error("Error updating dispatch:", error);
      throw new Error(error.response?.data?.message || "Failed to update dispatch");
    }
  },

  // Delete dispatch
  deleteDispatch: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/dispatches/${id}`);
    } catch (error: any) {
      console.error("Error deleting dispatch:", error);
      throw new Error(error.response?.data?.message || "Failed to delete dispatch");
    }
  },
};

export default dispatchAPI;
