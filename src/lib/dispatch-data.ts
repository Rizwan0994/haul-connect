
import apiClient from "./api-client";

export type Dispatch = {
  id: string;
  user_id: string;
  user: string;
  department: string;
  booking_date: string;
  created_at: string;
  load_no: string;
  pickup_date: string;
  dropoff_date: string;
  carrier_id: string;
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
  carrier?: {
    id: string;
    company_name: string;
    mc_number: string;
    owner_name: string;
    phone_number: string;
    email_address: string;
    truck_type: string;
    status: "active" | "inactive" | "pending" | "suspended";
  };
};

export const getAllDispatches = async () => {
  try {
    const response = await apiClient.get("/dispatches");
    return response.data.data;
  } catch (_error: any) {
    return [];
  }
};

export const getDispatchById = async (
  id: string,
): Promise<Dispatch | undefined> => {
  try {
    const response = await apiClient.get(`/dispatches/${id}`);
    return response.data.data;
  } catch (_error: any) {
    console.error("Error fetching dispatch:", _error);
    return undefined;
  }
};

export const createDispatch = async (
  dispatchData: Omit<Dispatch, "id">,
): Promise<Dispatch | undefined> => {
  try {
    const response = await apiClient.post("/dispatches", dispatchData);
    return response.data.data;
  } catch (_error: any) {
    console.error("Error creating dispatch:", _error);
    return undefined;
  }
};

export const updateDispatch = async (
  id: string,
  dispatchData: Partial<Omit<Dispatch, "id">>,
): Promise<Dispatch | undefined> => {
  try {
    const response = await apiClient.put(
      `/dispatches/${id}`,
      dispatchData,
    );
    return response.data.data;
  } catch (_error: any) {
    console.error("Error updating dispatch:", _error);
    return undefined;
  }
};

export const deleteDispatch = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/dispatches/${id}`);
    return true;
  } catch (_error: any) {
    console.error("Error deleting dispatch:", _error);
    return false;
  }
};
