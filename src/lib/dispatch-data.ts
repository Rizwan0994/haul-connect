import backendApiClient from "@/services/backendApi/client";
// import { v4 as uuidv4 } from "uuid";

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

export const getAllDispatches = async (cookie?: string) => {
  try {
    const headers: any = {};

    if (cookie) {
      headers["Cookie"] = cookie;

      const tokenMatch = cookie.match(/token=([^;]+)/);
      if (tokenMatch) {
        headers["Authorization"] = `Bearer ${tokenMatch[1]}`;
      }
    }

    const response = await backendApiClient.get("/dispatches", {
      headers,
    });

    return response.data.data;
    console.log(response.data.data)
  } catch (_error: any) {
    // console.log(
    //   "Error fetching dispatches:",
    //   error?.response?.data || error.message,
    // );
    return [];
  }
};

export const getDispatchById = async (
  id: string,
  cookie?: string,
): Promise<Dispatch | undefined> => {
  try {
    const headers: any = {};
    if (cookie) {
      headers["Cookie"] = cookie;

      const tokenMatch = cookie.match(/token=([^;]+)/);
      if (tokenMatch) {
        headers["Authorization"] = `Bearer ${tokenMatch[1]}`;
      }
    }
    const response = await backendApiClient.get(`/dispatches/${id}`, {
      headers,
    });
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
    const response = await backendApiClient.post("/dispatches", dispatchData);
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
    const response = await backendApiClient.put(
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
    await backendApiClient.delete(`/dispatches/${id}`);
    return true;
  } catch (_error: any) {
    console.error("Error deleting dispatch:", _error);
    return false;
  }
};