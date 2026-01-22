'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AppointmentCalendar } from '@/components/appointments/appointment-calendar';
import { AppointmentModal } from '@/components/appointments/appointment-modal';
import { useAppointments } from '@/hooks/use-appointments';
import { useStylists } from '@/hooks/use-stylists';
import type { Appointment } from '@/types';

export default function SchedulePage() {
  const { data: appointments, isLoading, error } = useAppointments();
  const { data: stylists } = useStylists();
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

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule Calendar</h1>
          <p className="text-gray-600">View and manage all appointments in calendar view</p>
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

      <div className="mb-4 flex items-center gap-4">
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
      </div>

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
