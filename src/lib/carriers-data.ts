import apiClient from "./api-client";

export interface Carrier {
  id: string;
  status: "active" | "inactive" | "pending" | "suspended";  mc_number: string;
  us_dot_number?: string;
  company_name: string;
  dba?: string;
  owner_name: string;
  // Driver details
  driver_name?: string;
  driver_phone?: string;
  driver_email?: string;
  driver_license_number?: string;
  driver_license_state?: string;
  driver_license_expiration?: string;
  phone_number: string;
  email_address: string;
  truck_type: string;
  address: string;
  dimensions?: string;
  doors_type?: string;
  door_clearance?: string;
  max_weight?: string;
  dock_height?: string;
  accessories?: string;
  temp_control_range?: string;
  agreed_percentage?: string;
  created_at?: string;
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
  notes_average_gross?: string;
  notes_parking_space?: string;
  notes_additional_preferences?: string;
  office_use_carrier_no?: string;
  office_use_team_assigned?: string;
  office_use_special_notes?: string;
  // Agent info
  agent_name?: string;
  ein_number?: string;  // Admin only fields
  dat_username?: string;
  dat_password?: string;
  truckstop_username?: string;
  truckstop_password?: string;
  truckstop_carrier_id?: string;
  truckstop_carrier_zip?: string;
  eld_provider?: string;
  eld_site?: string;
  eld_username?: string;
  eld_password?: string;
  mycarrierpackets_username?: string;
  mycarrierpackets_password?: string;
  highway_number?: string;
  highway_email?: string;
}

export const createCarrier = async (
  carrierData: Omit<Carrier, "id">,
): Promise<Carrier> => {
  try {
    const response = await apiClient.post("/carriers", carrierData);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error creating carrier");
  }
};

export const updateCarrier = async (
  id: string,
  carrierData: Partial<Carrier>,
): Promise<Carrier> => {
  try {
    const response = await apiClient.put(`/carriers/${id}`, carrierData);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error updating carrier");
  }
};

export const getCarrierById = async (id: string): Promise<Carrier> => {
  try {
    const response = await apiClient.get(`/carriers/${id}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error fetching carrier");
  }
};

export const getAllCarriers = async () => {
  try {
    const response = await apiClient.get("/carriers");
    console.log("Carriers response:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching carriers:", error);
    throw error;
  }
};

export const getCarrierById_fetch = async (id: string) => {
  try {
    const response = await fetch(
      `https://haul-connect.onrender.com/api/carriers/${id}`,
    );
    if (!response.ok) throw new Error("Failed to fetch carrier");
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching carrier:", error);
    return null;
  }
};

export async function deleteCarrier(id: string) {
  const response = await apiClient.delete(`/carriers/${id}`);
  return response.data;
}
