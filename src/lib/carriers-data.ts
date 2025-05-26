import backendApiClient from "@/services/backendApi/client";

export interface Carrier {
  id: string;
  status: "active" | "inactive" | "pending" | "suspended";
  mc_number: string;
  us_dot_number?: string;
  company_name: string;
  owner_name: string;
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
}

export const createCarrier = async (
  carrierData: Omit<Carrier, "id">,
): Promise<Carrier> => {
  try {
    const response = await backendApiClient.post("/carriers", carrierData);
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
    const response = await backendApiClient.put(`/carriers/${id}`, carrierData);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error updating carrier");
  }
};

export const getCarrierById = async (id: string): Promise<Carrier> => {
  try {
    const response = await backendApiClient.get(`/carriers/${id}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error fetching carrier");
  }
};

export const getAllCarriers = async () => {
  try {
    const response = await backendApiClient.get("/carriers");
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
  const response = await backendApiClient.delete(`/carriers/${id}`);
  return response.data;
}
export interface Carrier {
  id: string
  name: string
  email: string
  phone: string
  address: string
  status: 'active' | 'inactive'
  rating: number
  totalLoads: number
  onTimeDelivery: number
}

export const carriersData: Carrier[] = [
  {
    id: '1',
    name: 'Swift Transportation',
    email: 'contact@swift.com',
    phone: '+1-555-0101',
    address: '123 Transport Ave, Phoenix, AZ',
    status: 'active',
    rating: 4.5,
    totalLoads: 150,
    onTimeDelivery: 95
  },
  {
    id: '2',
    name: 'Schneider National',
    email: 'info@schneider.com',
    phone: '+1-555-0102',
    address: '456 Logistics Blvd, Green Bay, WI',
    status: 'active',
    rating: 4.2,
    totalLoads: 200,
    onTimeDelivery: 92
  },
  {
    id: '3',
    name: 'JB Hunt',
    email: 'support@jbhunt.com',
    phone: '+1-555-0103',
    address: '789 Freight St, Lowell, AR',
    status: 'inactive',
    rating: 4.0,
    totalLoads: 75,
    onTimeDelivery: 88
  }
]
