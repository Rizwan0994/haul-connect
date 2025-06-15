import apiClient from '../lib/api-client';

export interface Consignee {
  id?: number;
  consignee_id?: string;
  consignee_name: string;
  contact?: string;
  telephone?: string;
  address?: string;
  ext?: string;
  email?: string;
  notes?: string;
  attachment?: File | null;
  attachment_path?: string;
  attachment_filename?: string;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  createdBy?: {
    id: number;
    username: string;
    email: string;
  };
  updatedBy?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface ConsigneeListResponse {
  consignees: Consignee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ConsigneeApi {
  private baseUrl = '/consignees';

  async getAllConsignees(page = 1, limit = 10, search = ''): Promise<ConsigneeListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });

    const response = await apiClient.get(`${this.baseUrl}?${params}`);
    return response.data.data;
  }

  async getConsigneeById(id: number): Promise<Consignee> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data.data;
  }
  async createConsignee(consigneeData: Omit<Consignee, 'id' | 'consignee_id' | 'created_at' | 'updated_at' | 'createdBy' | 'updatedBy'>): Promise<Consignee> {
    const formData = new FormData();
    
    // Add all consignee data to FormData
    Object.entries(consigneeData).forEach(([key, value]) => {
      if (key === 'attachment' && value instanceof File) {
        formData.append('attachment', value);
      } else if (value !== null && value !== undefined && key !== 'attachment') {
        formData.append(key, value.toString());
      }
    });

    const response = await apiClient.post(this.baseUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }
  async updateConsignee(id: number, consigneeData: Partial<Consignee>): Promise<Consignee> {
    const formData = new FormData();
    
    // Add all consignee data to FormData
    Object.entries(consigneeData).forEach(([key, value]) => {
      if (key === 'attachment' && value instanceof File) {
        formData.append('attachment', value);
      } else if (value !== null && value !== undefined && key !== 'attachment' && key !== 'createdBy' && key !== 'updatedBy') {
        formData.append(key, value.toString());
      }
    });

    const response = await apiClient.put(`${this.baseUrl}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  async deleteConsignee(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async downloadAttachment(consigneeId: number, filename: string): Promise<Blob> {
    const response = await apiClient.get(`${this.baseUrl}/${consigneeId}/download/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export const consigneeApi = new ConsigneeApi();
