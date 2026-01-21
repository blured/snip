import { apiClient } from './client';
import type { Client } from '@/types';

export const clientsApi = {
  getAll: async (): Promise<Client[]> => {
    const response = await apiClient.get('/api/clients');
    return response.data;
  },

  getById: async (id: string): Promise<Client> => {
    const response = await apiClient.get(`/api/clients/${id}`);
    return response.data;
  },

  create: async (data: Partial<Client>): Promise<Client> => {
    const response = await apiClient.post('/api/clients', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Client>): Promise<Client> => {
    const response = await apiClient.put(`/api/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/clients/${id}`);
  },

  getAppointments: async (id: string): Promise<any[]> => {
    const response = await apiClient.get(`/api/clients/${id}/appointments`);
    return response.data;
  },

  getInvoices: async (id: string): Promise<any[]> => {
    const response = await apiClient.get(`/api/clients/${id}/invoices`);
    return response.data;
  },
};
