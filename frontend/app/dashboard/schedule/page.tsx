'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AppointmentCalendar } from '@/components/appointments/appointment-calendar';
import { AppointmentModal } from '@/components/appointments/appointment-modal';
import { useAppointments, useUpdateAppointment } from '@/hooks/use-appointments';
import { useStylists } from '@/hooks/use-stylists';
import { useDashboardStats } from '@/hooks/use-dashboard';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, DollarSign, Scissors, TrendingUp } from 'lucide-react';
import type { Appointment } from '@/types';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export default function SchedulePage() {
  const router = useRouter();
  const { data: appointments, isLoading, error } = useAppointments();
  const { data: stylists } = useStylists();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const updateAppointment = useUpdateAppointment();

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [stylistFilter, setStylistFilter] = useState<string>('');

  const handleEventClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(undefined);
  };

  const handleEventDrop = async (appointmentId: string, newStart: Date, newEnd: Date, newResourceId?: string) => {
    try {
      await updateAppointment.mutateAsync({
        id: appointmentId,
        data: {
          scheduledStart: newStart.toISOString(),
          scheduledEnd: newEnd.toISOString(),
          ...(newResourceId && { stylistId: newResourceId }),
        },
      });
      toast.success('Appointment rescheduled successfully');
    } catch (error) {
      toast.error('Failed to reschedule appointment');
      throw error;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate additional stats from appointments
  const todayAppointments = appointments?.filter((a) => {
    const appointmentDate = new Date(a.scheduledStart);
    const today = new Date();
    return (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    );
  }).length ?? 0;

  const thisWeekAppointments = appointments?.filter((a) => {
    const appointmentDate = new Date(a.scheduledStart);
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    return appointmentDate >= weekStart && appointmentDate <= new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  }).length ?? 0;

  const confirmedAppointments = appointments?.filter((a) => a.status === 'CONFIRMED').length ?? 0;

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule Calendar</h1>
          <p className="text-gray-600">Manage appointments and view your schedule at a glance</p>
        </div>
        <button
          onClick={() => {
            setSelectedAppointment(undefined);
            setShowModal(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Schedule Appointment
        </button>
      </div>

      {/* Stats Cards - Syncfusion Style */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-blue-500">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="rounded-lg bg-blue-100 p-2">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase">Today</p>
              <p className="text-2xl font-bold text-gray-900">{todayAppointments}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="rounded-lg bg-green-100 p-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{thisWeekAppointments}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="rounded-lg bg-purple-100 p-2">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase">Clients</p>
              <p className="text-2xl font-bold text-gray-900">{statsLoading ? '...' : stats?.activeClients ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-500">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="rounded-lg bg-orange-100 p-2">
              <Scissors className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase">Stylists</p>
              <p className="text-2xl font-bold text-gray-900">{stylists?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-teal-500">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="rounded-lg bg-teal-100 p-2">
              <DollarSign className="h-5 w-5 text-teal-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{statsLoading ? '...' : formatCurrency(stats?.monthlyRevenue ?? 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Stylist:</label>
          <select
            value={stylistFilter}
            onChange={(e) => setStylistFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Stylists</option>
            {stylists?.map((stylist) => (
              <option key={stylist.id} value={stylist.id}>
                {stylist.user.firstName} {stylist.user.lastName}
              </option>
            ))}
          </select>
          <div className="ml-auto text-sm text-gray-500">
            Tip: Click appointments to edit • Drag to reschedule • Drag edges to resize
          </div>
        </div>
      </div>

      {/* Calendar - Main Feature */}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-12">
          <div className="text-gray-500">Loading calendar...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-12">
          <div className="text-red-500">Failed to load appointments</div>
        </div>
      ) : (
        <AppointmentCalendar
          appointments={appointments ?? []}
          stylists={stylists ?? []}
          stylistFilter={stylistFilter}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
        />
      )}

      <AppointmentModal
        isOpen={showModal}
        onClose={handleCloseModal}
        appointment={selectedAppointment}
      />
    </DashboardLayout>
  );
}
