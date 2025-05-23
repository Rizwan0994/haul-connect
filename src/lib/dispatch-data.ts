import backendApiClient from "@/services/backendApi/client";
import { v4 as uuidv4 } from "uuid";

export type Dispatch = {
  id: string;
  user_id: string;
  department: string;
  booking_date: string;
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
  invoice_status:
    | "Not Sent"
    | "Invoice Sent"
    | "Invoice Pending"
    | "Invoice Cleared";
  payment_method: "ACH" | "ZELLE" | "OTHER";
  carrier?: {
    company_name: string;
    mc_number: string;
    owner_name: string;
  };
};

export const getAllDispatches = async (): Promise<Dispatch[]> => {
  try {
    const response = await backendApiClient.get("/dispatches");
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      window.location.href = '/auth/login';
      return [];
    }
    console.error("Error fetching dispatches:", error);
    return [];
  }
};

export const getDispatchById = async (
  id: string,
): Promise<Dispatch | undefined> => {
  try {
    const response = await backendApiClient.get(`/dispatches/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching dispatch:", error);
    return undefined;
  }
};

export const createDispatch = async (
  dispatchData: Omit<Dispatch, "id">,
): Promise<Dispatch | undefined> => {
  try {
    const response = await backendApiClient.post("/dispatches", dispatchData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating dispatch:", error);
    return undefined;
  }
};

export const updateDispatch = async (
  id: string,
  dispatchData: Partial<Omit<Dispatch, "id">>,
): Promise<Dispatch | undefined> => {
  try {
    const response = await backendApiClient.put(
      `/dispatches/${id}`,
      dispatchData,
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating dispatch:", error);
    return undefined;
  }
};

export const deleteDispatch = async (id: string): Promise<boolean> => {
  try {
    await backendApiClient.delete(`/dispatches/${id}`);
    return true;
  } catch (error) {
    console.error("Error deleting dispatch:", error);
    return false;
  }
};
