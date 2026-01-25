'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AppointmentModal } from '@/components/appointments/appointment-modal';

const AppointmentCalendar = dynamic(
  () => import('@/components/appointments/appointment-calendar').then(mod => ({ default: mod.AppointmentCalendar })),
  { ssr: false }
);
import {
  CalendarSettingsModal,
  useCalendarSettings,
  CalendarSettingsButton,
} from '@/components/appointments/calendar-settings-modal';
import { useAppointments, useUpdateAppointment } from '@/hooks/use-appointments';
import { useStylists } from '@/hooks/use-stylists';
import toast from 'react-hot-toast';
import type { Appointment } from '@/types';

// For creating new appointments from calendar clicks
interface NewAppointmentData {
  startTime: Date;
  endTime: Date;
  stylistId?: string;
}

export default function SchedulePage() {
  const router = useRouter();
  const { data: appointments, isLoading, error } = useAppointments();
  const { data: stylists } = useStylists();
  const updateAppointment = useUpdateAppointment();
  const { settings, saveSettings } = useCalendarSettings();

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [stylistFilter, setStylistFilter] = useState<string>('');
  const [newAppointmentData, setNewAppointmentData] = useState<NewAppointmentData | null>(null);

  const handleEventClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
    setNewAppointmentData(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(undefined);
    setNewAppointmentData(null);
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

  const handleAppointmentCreate = (data: NewAppointmentData) => {
    setNewAppointmentData(data);
    setSelectedAppointment(undefined);
    setShowModal(true);
  };

  return (
    <DashboardLayout>
      <div className="mb-4 flex justify-end">
        <CalendarSettingsButton onClick={() => setShowSettings(true)} />
      </div>

      {/* Calendar */}
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
          calendarSettings={settings}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
          onStylistFilterChange={setStylistFilter}
          onAppointmentCreate={handleAppointmentCreate}
        />
      )}

      <AppointmentModal
        isOpen={showModal}
        onClose={handleCloseModal}
        appointment={selectedAppointment}
        newAppointmentData={newAppointmentData}
      />

      <CalendarSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={saveSettings}
      />
    </DashboardLayout>
  );
}
