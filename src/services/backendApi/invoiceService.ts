import apiClient from './client';

export async function sendInvoiceEmail(invoiceId: string | number) {
  const response = await apiClient.post(`/invoices/${invoiceId}/send-email`);
  return response.data;
}