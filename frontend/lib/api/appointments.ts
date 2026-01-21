import { apiClient } from './client';
import type { Appointment, CreateAppointmentRequest } from '@/types';

export const appointmentsApi = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await apiClient.get('/api/appointments');
    return response.data;
  },

  getById: async (id: string): Promise<Appointment> => {
    const response = await apiClient.get(`/api/appointments/${id}`);
    return response.data;
  },

  create: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await apiClient.post('/api/appointments', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
    const response = await apiClient.put(`/api/appointments/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/appointments/${id}`);
  },

  cancel: async (id: string, reason: string): Promise<Appointment> => {
    const response = await apiClient.patch(`/api/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  getByDateRange: async (start: string, end: string): Promise<Appointment[]> => {
    const response = await apiClient.get('/api/appointments', {
      params: { start, end },
    });
    return response.data;
  },
};
