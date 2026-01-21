import { apiClient } from './client';
import type { Stylist, StylistAvailability, StylistTimeOff } from '@/types';

export const stylistsApi = {
  getAll: async (): Promise<Stylist[]> => {
    const response = await apiClient.get('/api/stylists');
    return response.data;
  },

  getById: async (id: string): Promise<Stylist> => {
    const response = await apiClient.get(`/api/stylists/${id}`);
    return response.data;
  },

  create: async (data: Partial<Stylist>): Promise<Stylist> => {
    const response = await apiClient.post('/api/stylists', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Stylist>): Promise<Stylist> => {
    const response = await apiClient.put(`/api/stylists/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/stylists/${id}`);
  },

  getAvailability: async (id: string): Promise<StylistAvailability[]> => {
    const response = await apiClient.get(`/api/stylists/${id}/availability`);
    return response.data;
  },

  setAvailability: async (id: string, data: Partial<StylistAvailability>[]): Promise<StylistAvailability[]> => {
    const response = await apiClient.post(`/api/stylists/${id}/availability`, data);
    return response.data;
  },

  getTimeOff: async (id: string): Promise<StylistTimeOff[]> => {
    const response = await apiClient.get(`/api/stylists/${id}/timeoff`);
    return response.data;
  },

  requestTimeOff: async (id: string, data: Partial<StylistTimeOff>): Promise<StylistTimeOff> => {
    const response = await apiClient.post(`/api/stylists/${id}/timeoff`, data);
    return response.data;
  },
};
