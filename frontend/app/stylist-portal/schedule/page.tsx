'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AppointmentCalendar } from '@/components/appointments/appointment-calendar';
import { useAppointments } from '@/hooks/use-appointments';
import { useStylists } from '@/hooks/use-stylists';
import type { Appointment } from '@/types';
import { toast from 'react-hot-toast';
import { useState } from 'react';

export default function StylistSchedulePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { data: appointments, isLoading, error } = useAppointments();
  const { data: stylists } = useStylists();

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    // Only allow stylists to access this page
    if (user && user.role !== 'STYLIST') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  const handleEventClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  // Filter appointments to only show this stylist's appointments
  const stylistAppointments = appointments?.filter(
    (apt) => apt.stylistId === user.stylistId
  );

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-gray-600">View and manage your appointments</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading schedule...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-red-500">Failed to load schedule</div>
        </div>
      ) : (
        <AppointmentCalendar
          appointments={stylistAppointments ?? []}
          stylists={stylists?.filter(s => s.id === user.stylistId) ?? []}
          stylistFilter=""
          onEventClick={handleEventClick}
          onEventDrop={async () => {
            toast.error('Please contact reception to reschedule');
          }}
          onStylistFilterChange={() => {}}
        />
      )}
    </DashboardLayout>
  );
}
