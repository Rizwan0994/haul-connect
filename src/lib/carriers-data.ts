/**
 * This file contains mock data for the carrier management system.
 * In a real application, this would be replaced with actual API calls.
 */

import backendApiClient from '@/services/backendApi/client';

export interface Carrier {
  id: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  mc_number: string;
  company_name: string;
  owner_name: string;
  phone_number: string;
  email_address: string;
  truck_type: string;
  [key: string]: any;
}

export const createCarrier = async (carrierData: Omit<Carrier, 'id'>): Promise<Carrier> => {
  try {
    const response = await backendApiClient.post('/carriers', carrierData);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error creating carrier');
  }
};

export const updateCarrier = async (id: string, carrierData: Partial<Carrier>): Promise<Carrier> => {
  try {
    const response = await backendApiClient.put(`/carriers/${id}`, carrierData);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error updating carrier');
  }
};

export const getCarrierById = async (id: string): Promise<Carrier> => {
  try {
    const response = await backendApiClient.get(`/carriers/${id}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error fetching carrier');
  }
};

export async function getAllCarriers() {
  const response = await backendApiClient.get("/carriers");
  return response.data.data || [];
}

export async function deleteCarrier(id: string) {
  const response = await backendApiClient.delete(`/carriers/${id}`);
  return response.data;
}