'use client';

import React, { useState, useEffect } from 'react';
import type { Appointment, AppointmentStatus } from '@/types';
import type { AppointmentCalendarProps } from './appointment-calendar-types';

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: '#3b82f6',
  CONFIRMED: '#22c55e',
  IN_PROGRESS: '#eab308',
  COMPLETED: '#22c55e',
  CANCELLED: '#6b7280',
  NO_SHOW: '#ef4444',
};

export function AppointmentCalendarSimple({
  appointments,
  stylists = [],
  stylistFilter,
  onEventClick,
}: AppointmentCalendarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="p-8 text-center">Loading calendar...</div>;
  }

  // Filter appointments
  const filteredAppointments = stylistFilter
    ? appointments.filter((a) => a.stylistId === stylistFilter)
    : appointments;

  // Group appointments by date
  const appointmentsByDate: Record<string, Appointment[]> = {};
  filteredAppointments.forEach((apt) => {
    const date = new Date(apt.scheduledStart).toDateString();
    if (!appointmentsByDate[date]) {
      appointmentsByDate[date] = [];
    }
    appointmentsByDate[date].push(apt);
  });

  // Sort dates
  const sortedDates = Object.keys(appointmentsByDate).sort((a, b) =>
    new Date(a).getTime() - new Date(b).getTime()
  );

  // Get stylist name
  const getStylistName = (stylistId: string) => {
    const stylist = stylists.find((s) => s.id === stylistId);
    return stylist ? `${stylist.user.firstName} ${stylist.user.lastName}` : 'Unknown';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
        <p className="text-gray-600 mt-1">
          {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} scheduled
        </p>
      </div>

      {sortedDates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No appointments scheduled</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <div className="space-y-2">
                {appointmentsByDate[date]
                  .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime())
                  .map((appointment) => {
                    const startDate = new Date(appointment.scheduledStart);
                    const endDate = new Date(appointment.scheduledEnd);
                    const statusColor = STATUS_COLORS[appointment.status];

                    return (
                      <div
                        key={appointment.id}
                        onClick={() => onEventClick?.(appointment)}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        style={{ borderLeftWidth: '4px', borderLeftColor: statusColor }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-800">
                                {appointment.client.user.firstName} {appointment.client.user.lastName}
                              </h4>
                              <span
                                className="px-2 py-1 text-xs rounded-full text-white"
                                style={{ backgroundColor: statusColor }}
                              >
                                {appointment.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                <span className="font-medium">Time:</span>{' '}
                                {startDate.toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}{' '}
                                -{' '}
                                {endDate.toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              <p>
                                <span className="font-medium">Stylist:</span> {getStylistName(appointment.stylistId)}
                              </p>
                              {appointment.services && appointment.services.length > 0 && (
                                <p>
                                  <span className="font-medium">Services:</span>{' '}
                                  {appointment.services.map((s: any) => s.name).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
