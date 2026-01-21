import { apiClient } from './client';
import type { Invoice, Payment } from '@/types';

export const invoicesApi = {
  getAll: async (): Promise<Invoice[]> => {
    const response = await apiClient.get('/api/invoices');
    return response.data;
  },

  getById: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get(`/api/invoices/${id}`);
    return response.data;
  },

  create: async (data: Partial<Invoice>): Promise<Invoice> => {
    const response = await apiClient.post('/api/invoices', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Invoice>): Promise<Invoice> => {
    const response = await apiClient.put(`/api/invoices/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/invoices/${id}`);
  },

  addPayment: async (id: string, payment: Partial<Payment>): Promise<Payment> => {
    const response = await apiClient.post(`/api/invoices/${id}/payments`, payment);
    return response.data;
  },

  markAsPaid: async (id: string): Promise<Invoice> => {
    const response = await apiClient.patch(`/api/invoices/${id}/paid`);
    return response.data;
  },
};
