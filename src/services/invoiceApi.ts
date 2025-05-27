import apiClient from '../lib/api-client';

export interface InvoiceData {
  id?: string | number;
  // Add other invoice properties as needed
}

export const invoiceApiService = {
  // Send invoice email
  sendInvoiceEmail: async (invoiceId: string | number): Promise<any> => {
    try {
      const response = await apiClient.post(`/invoices/${invoiceId}/send-email`);
      return response.data;
    } catch (error) {
      console.error('Error sending invoice email:', error);
      throw error;
    }
  },

  // Add other invoice-related API methods here as needed
  getAllInvoices: async (): Promise<InvoiceData[]> => {
    try {
      const response = await apiClient.get('/invoices');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  getInvoiceById: async (id: string | number): Promise<InvoiceData> => {
    try {
      const response = await apiClient.get(`/invoices/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  },
};
