'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AppointmentCalendar } from '@/components/appointments/appointment-calendar';
import { useAppointments, useUpdateAppointment } from '@/hooks/use-appointments';
import { useStylists } from '@/hooks/use-stylists';
import toast from 'react-hot-toast';
import type { Appointment } from '@/types';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function ClientAppointmentsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { data: appointments, isLoading, error } = useAppointments();
  const { data: stylists } = useStylists();
  const updateAppointment = useUpdateAppointment();

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    // Only allow clients to access this page
    if (user && user.role !== 'CLIENT') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();

  const handleEventClick = (appointment: Appointment) => {
    // Clients can only view, not edit
    setSelectedAppointment(appointment);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading appointments...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-red-500">Failed to load appointments</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600">View and manage your upcoming appointments</p>
      </div>

      <AppointmentCalendar
        appointments={appointments ?? []}
        stylists={stylists ?? []}
        stylistFilter=""
        onEventClick={handleEventClick}
        onEventDrop={async () => {
          toast.error('Please contact the salon to reschedule');
        }}
        onStylistFilterChange={() => {}}
      />
    </DashboardLayout>
  );
}
