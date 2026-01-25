'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

const AppointmentCalendar = dynamic(
  () => import('@/components/appointments/appointment-calendar').then(mod => ({ default: mod.AppointmentCalendar })),
  { ssr: false }
);
import {
  CalendarSettingsModal,
  useCalendarSettings,
  CalendarSettingsButton,
} from '@/components/appointments/calendar-settings-modal';
import { useAppointments } from '@/hooks/use-appointments';
import { useStylists } from '@/hooks/use-stylists';
import type { Appointment } from '@/types';
import toast from 'react-hot-toast';

export default function StylistSchedulePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { data: appointments, isLoading, error } = useAppointments();
  const { data: stylists } = useStylists();
  const { settings, saveSettings } = useCalendarSettings();

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [showSettings, setShowSettings] = useState(false);

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
      <div className="mb-4 flex justify-end">
        <CalendarSettingsButton onClick={() => setShowSettings(true)} />
      </div>

      <div className="mb-4">
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
          calendarSettings={settings}
          onEventClick={handleEventClick}
          onEventDrop={async () => {
            toast.error('Please contact reception to reschedule');
          }}
          onStylistFilterChange={() => {}}
        />
      )}

      <CalendarSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={saveSettings}
      />
    </DashboardLayout>
  );
}
