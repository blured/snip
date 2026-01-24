'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, DollarSign, Scissors, Clock } from 'lucide-react';
import { useDashboardStats, useUpcomingAppointments } from '@/hooks/use-dashboard';
import { format, isToday, isTomorrow } from 'date-fns';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingAppointments();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy • h:mm a');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'danger';
      case 'COMPLETED':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full bg-blue-500 p-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.todayAppointments ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full bg-green-500 p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.activeClients ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full bg-purple-500 p-3">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : formatCurrency(stats?.monthlyRevenue ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full bg-orange-500 p-3">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Stylists</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.activeStylists ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : upcoming && upcoming.length > 0 ? (
              <div className="space-y-4">
                {upcoming.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-start justify-between rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {appointment.client.user.firstName} {appointment.client.user.lastName}
                        </p>
                        <Badge variant={getStatusVariant(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        with {appointment.stylist.user.firstName} {appointment.stylist.user.lastName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {appointment.services.map((s) => s.service.name).join(' • ')}
                      </p>
                      <p className="mt-2 text-xs font-medium text-blue-600">
                        {formatAppointmentDate(appointment.scheduledStart)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No upcoming appointments.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/dashboard/appointments"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">New Appointment</p>
                <p className="text-sm text-gray-500">Schedule a new appointment</p>
              </div>
            </a>
            <a
              href="/dashboard/clients"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Add Client</p>
                <p className="text-sm text-gray-500">Register a new client</p>
              </div>
            </a>
            <a
              href="/dashboard/invoices"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Create Invoice</p>
                <p className="text-sm text-gray-500">Generate a new invoice</p>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
