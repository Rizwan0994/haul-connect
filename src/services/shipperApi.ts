import apiClient from '../lib/api-client';

export interface Shipper {
  id?: number;
  shipper_id?: string;
  shipper_name: string;
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

export interface ShipperListResponse {
  shippers: Shipper[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ShipperApi {
  private baseUrl = '/shippers';
  async getAllShippers(page = 1, limit = 10, search = ''): Promise<ShipperListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });

    const response = await apiClient.get(`${this.baseUrl}?${params}`);
    return response.data.data;
  }

  async getShipperById(id: number): Promise<Shipper> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  async createShipper(shipperData: Omit<Shipper, 'id' | 'shipper_id' | 'created_at' | 'updated_at' | 'createdBy' | 'updatedBy'>): Promise<Shipper> {
    const formData = new FormData();
    
    // Add all shipper data to FormData
    Object.entries(shipperData).forEach(([key, value]) => {
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

  async updateShipper(id: number, shipperData: Partial<Shipper>): Promise<Shipper> {
    const formData = new FormData();
    
    // Add all shipper data to FormData
    Object.entries(shipperData).forEach(([key, value]) => {
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

  async deleteShipper(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async downloadAttachment(shipperId: number, filename: string): Promise<Blob> {
    const response = await apiClient.get(`${this.baseUrl}/${shipperId}/download/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export const shipperApi = new ShipperApi();
