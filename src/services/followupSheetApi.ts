import apiClient from '../lib/api-client';

export interface FollowupSheet {
  id: number;
  agent_name: string;
  date: string;
  name: string;
  mc_no: string;
  contact: string;
  email: string;
  truck_type: string;
  preferred_lanes: string;
  equipment: string;
  zip_code: string;
  percentage: number;
  comments: string;
  created_at: string;
  updated_at: string;
}

export interface FollowupSheetFormData {
  agent_name: string;
  date: string;
  name: string;
  mc_no: string;
  contact: string;
  email: string;
  truck_type: string;
  preferred_lanes: string;
  equipment: string;
  zip_code: string;
  percentage: number;
  comments: string;
}

export interface FollowupSheetsResponse {
  success: boolean;
  data: FollowupSheet[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FollowupSheetResponse {
  success: boolean;
  data: FollowupSheet;
  message?: string;
}

export interface FollowupSheetStatsResponse {
  success: boolean;
  data: {
    total: number;
    thisMonth: number;
    today: number;
    averagePercentage: string;
  };
}

class FollowupSheetApi {
  async getAll(page = 1, limit = 10, search = ''): Promise<FollowupSheet[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });

    const response = await apiClient.get<FollowupSheetsResponse>(`/followup-sheets?${params}`);
    return response.data.data;
  }

  async getById(id: number): Promise<FollowupSheet> {
    const response = await apiClient.get<FollowupSheetResponse>(`/followup-sheets/${id}`);
    return response.data.data;
  }

  async create(data: FollowupSheetFormData): Promise<FollowupSheet> {
    const response = await apiClient.post<FollowupSheetResponse>('/followup-sheets', data);
    return response.data.data;
  }

  async update(id: number, data: FollowupSheetFormData): Promise<FollowupSheet> {
    const response = await apiClient.put<FollowupSheetResponse>(`/followup-sheets/${id}`, data);
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/followup-sheets/${id}`);
  }

  async getStats(): Promise<FollowupSheetStatsResponse['data']> {
    const response = await apiClient.get<FollowupSheetStatsResponse>('/followup-sheets/stats');
    return response.data.data;
  }
}

export default new FollowupSheetApi();
