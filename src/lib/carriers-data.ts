/**
 * This file contains mock data for the carrier management system.
 * In a real application, this would be replaced with actual API calls.
 */

import backendApiClient from "@/services/backendApi/client";

export type Carrier = {
  id: string;
  agent_name: string;
  mc_number: string;
  us_dot_number: string;
  company_name: string;
  owner_name: string;
  phone_number: string;
  email_address: string;
  address: string;
  ein_number: string;
  truck_type: string;
  dock_height: string;
  dimensions: string;
  doors_type: string;
  door_clearance: string;
  accessories: string;
  max_weight: string;
  temp_control_range: string;
  agreed_percentage: string;
  status: "active" | "inactive" | "pending" | "suspended";
  insurance_company_name: string;
  insurance_company_address: string;
  insurance_agent_name: string;
  insurance_agent_number: string;
  insurance_agent_email: string;
  factoring_company_name: string;
  factoring_company_address: string;
  factoring_agent_name: string;
  factoring_agent_number: string;
  factoring_agent_email: string;
  notes_home_town: string;
  notes_days_working: string;
  notes_preferred_lanes: string;
  notes_additional_preferences: string;
  notes_parking_space: string;
  notes_average_gross: string;
  created_at: string;
};

export async function getAllCarriers() {
  const response = await backendApiClient.get("/carriers");
  return response.data.data || [];
}

export async function getCarrierById(id: string) {
  const response = await backendApiClient.get(`/carriers/${id}`);
  return response.data.data;
}

export async function createCarrier(data: Partial<Carrier>) {
  // Ensure required fields are present and have values
  const requiredFields = [
    "mc_number",
    "company_name",
    "owner_name", 
    "phone_number",
    "email_address",
    "truck_type",
    "status"
  ];

  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Remove empty string values
  const cleanedData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== '')
  );

  const response = await backendApiClient.post("/carriers", cleanedData);
  return response.data.data;
}

export async function updateCarrier(id: string, data: any) {
  const response = await backendApiClient.put(`/carriers/${id}`, data);
  return response.data.data;
}

export async function deleteCarrier(id: string) {
  const response = await backendApiClient.delete(`/carriers/${id}`);
  return response.data;
}