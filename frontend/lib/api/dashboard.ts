import { apiClient } from './client';

export interface DashboardStats {
  todayAppointments: number;
  activeClients: number;
  activeStylists: number;
  monthlyRevenue: number;
}

export interface UpcomingAppointment {
  id: string;
  date: string;
  status: string;
  notes: string | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  stylist: {
    id: string;
    firstName: string;
    lastName: string;
  };
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/api/dashboard/stats');
    return response.data;
  },

  getUpcomingAppointments: async (): Promise<UpcomingAppointment[]> => {
    const response = await apiClient.get<UpcomingAppointment[]>('/api/dashboard/upcoming');
    return response.data;
  },
};
