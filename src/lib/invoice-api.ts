import apiClient from "./api-client";

// TypeScript interfaces for Invoice data
export interface InvoiceFormData {
  dispatch_id: number;
  custom_message?: string;
  recipient_email?: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  dispatch_id: number;
  total_amount: number;
  carrier_amount: number;
  profit_amount: number;
  carrier_percentage: number;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  email_sent_at?: string;
  email_sent_to?: string;
  payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  dispatch?: {
    id: number;
    load_no: string;
    origin: string;
    destination: string;
    pickup_date: string;
    dropoff_date: string;
    load_amount: number;
    charge_percent: number;
    carrier?: {
      id: number;
      company_name: string;
      mc_number: string;
      owner_name: string;
      phone_number: string;
      email_address: string;
    };
    user?: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

export interface CreateInvoiceRequest {
  dispatch_id: number;
  invoice_number?: string;
  total_amount?: number;
  carrier_amount?: number;
  profit_amount?: number;
  carrier_percentage?: number;
  invoice_date?: string;
  due_date?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  carrierInfo?: {
    name: string;
    email: string;
    phone: string;
    mcNumber: string;
  };
  serviceDetails?: {
    pickupDate: string;
    deliveryDate: string;
    pickupLocation: string;
    deliveryLocation: string;
    loadNumber: string;
    bolNumber: string;
  };
}

export interface UpdateInvoiceRequest extends Partial<Invoice> {}

export interface SendEmailRequest {
  invoiceId: number;
  recipientEmail: string;
  subject: string;
  message: string;
}

export interface InvoicesResponse {
  invoices: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API functions
export const invoiceAPI = {
  // Get all invoices
  getAllInvoices: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<InvoicesResponse> => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append('status', params.status);
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());

      const response = await apiClient.get(`/invoices?${searchParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching invoices:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch invoices");
    }
  },

  // Get invoice by ID
  getInvoiceById: async (id: number): Promise<Invoice> => {
    try {
      const response = await apiClient.get(`/invoices/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching invoice:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch invoice");
    }
  },

  // Get invoice by dispatch ID
  getInvoiceByDispatchId: async (dispatchId: number): Promise<Invoice> => {
    try {
      const response = await apiClient.get(`/invoices/dispatch/${dispatchId}`);
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching invoice by dispatch ID:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch invoice");
    }
  },

  // Create new invoice
  createInvoice: async (data: CreateInvoiceRequest): Promise<Invoice> => {
    try {
      const response = await apiClient.post("/invoices", data);
      return response.data.data;
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      throw new Error(error.response?.data?.message || "Failed to create invoice");
    }
  },

  // Update invoice
  updateInvoice: async (id: number, data: UpdateInvoiceRequest): Promise<Invoice> => {
    try {
      const response = await apiClient.put(`/invoices/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error("Error updating invoice:", error);
      throw new Error(error.response?.data?.message || "Failed to update invoice");
    }
  },

  // Delete invoice
  deleteInvoice: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/invoices/${id}`);
    } catch (error: any) {
      console.error("Error deleting invoice:", error);
      throw new Error(error.response?.data?.message || "Failed to delete invoice");
    }
  },
  // Send invoice email
  sendInvoiceEmail: async (data: SendEmailRequest): Promise<void> => {
    try {
      await apiClient.post(`/invoices/${data.invoiceId}/send-email`, {
        recipient_email: data.recipientEmail,
        subject: data.subject,
        message: data.message
      });
    } catch (error: any) {
      console.error("Error sending invoice email:", error);
      throw new Error(error.response?.data?.message || "Failed to send invoice email");
    }
  },

  // Generate PDF invoice (if needed separately)
  downloadInvoicePDF: async (id: number): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/invoices/${id}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error("Error downloading invoice PDF:", error);
      throw new Error(error.response?.data?.message || "Failed to download invoice PDF");
    }
  }
};
