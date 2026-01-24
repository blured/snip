'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Calendar, Users, Banknote, Scissors, Plus, Pencil } from 'lucide-react';
import { useDashboardStats, useUpcomingAppointments } from '@/hooks/use-dashboard';
import { useAuth } from '@/hooks/use-auth';
import { format, isToday, isTomorrow } from 'date-fns';
import { AppointmentModal } from '@/components/appointments/appointment-modal';
import type { Appointment } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingAppointments();
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();

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

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(undefined);
    setShowAppointmentModal(true);
  };

  // Redirect clients to client portal
  if (user?.role === 'CLIENT') {
    router.push('/client-portal/appointments');
    return null;
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>
        <Button onClick={handleNewAppointment} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          New Appointment
        </Button>
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
              <Banknote className="h-6 w-6 text-white" />
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

      {/* Upcoming Appointments Table */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {upcomingLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          ) : upcoming && upcoming.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Stylist</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcoming.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{format(new Date(appointment.scheduledStart), 'MMM dd, yyyy')}</div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(appointment.scheduledStart), 'h:mm a')} - {format(new Date(appointment.scheduledEnd), 'h:mm a')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {appointment.client.user.firstName} {appointment.client.user.lastName}
                    </TableCell>
                    <TableCell>
                      {appointment.stylist.user.firstName} {appointment.stylist.user.lastName}
                    </TableCell>
                    <TableCell>
                      {appointment.services.map((s) => (
                        <span
                          key={s.id}
                          className="mr-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                        >
                          {s.service.name}
                        </span>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAppointment(appointment)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">No upcoming appointments.</p>
              <Button onClick={handleNewAppointment} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => {
          setShowAppointmentModal(false);
          setSelectedAppointment(undefined);
        }}
        appointment={selectedAppointment}
      />
    </DashboardLayout>
  );
}
