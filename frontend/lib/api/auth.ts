import { apiClient } from './client';
import type { LoginRequest, LoginResponse, User } from '@/types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  register: async (data: { email: string; password: string; firstName: string; lastName: string; role?: string }): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put('/api/auth/me', data);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  adminChangePassword: async (userId: string, newPassword: string): Promise<{ message: string; user: any }> => {
    const response = await apiClient.post('/api/auth/admin/change-password', {
      userId,
      newPassword,
    });
    return response.data;
  },
};
