'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AppointmentCalendar } from '@/components/appointments/appointment-calendar';
import { AppointmentModal } from '@/components/appointments/appointment-modal';
import { useAppointments, useUpdateAppointment } from '@/hooks/use-appointments';
import { useStylists } from '@/hooks/use-stylists';
import toast from 'react-hot-toast';
import type { Appointment } from '@/types';

export default function SchedulePage() {
  const { data: appointments, isLoading, error } = useAppointments();
  const { data: stylists } = useStylists();
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

  return (
    <DashboardLayout>
      {/* Calendar - Full Width like Syncfusion Showcase */}
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
          onStylistFilterChange={setStylistFilter}
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
