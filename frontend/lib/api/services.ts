import { apiClient } from './client';
import type { Service } from '@/types';

export const servicesApi = {
  getAll: async (): Promise<Service[]> => {
    const response = await apiClient.get('/api/services');
    return response.data;
  },

  getById: async (id: string): Promise<Service> => {
    const response = await apiClient.get(`/api/services/${id}`);
    return response.data;
  },

  create: async (data: Partial<Service>): Promise<Service> => {
    const response = await apiClient.post('/api/services', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Service>): Promise<Service> => {
    const response = await apiClient.put(`/api/services/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/services/${id}`);
  },

  getByCategory: async (category: string): Promise<Service[]> => {
    const response = await apiClient.get('/api/services', {
      params: { category },
    });
    return response.data;
  },
};
