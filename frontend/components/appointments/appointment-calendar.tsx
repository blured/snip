'use client';

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput, EventClickArg, DatesSetArg } from '@fullcalendar/core';
import type { Appointment, AppointmentStatus } from '@/types';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  stylistFilter?: string;
  onEventClick?: (appointment: Appointment) => void;
  onDatesChange?: (start: Date, end: Date) => void;
}

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: '#3b82f6',      // Blue
  CONFIRMED: '#22c55e',      // Green
  IN_PROGRESS: '#eab308',    // Yellow
  COMPLETED: '#22c55e',      // Green
  CANCELLED: '#6b7280',      // Gray
  NO_SHOW: '#ef4444',        // Red
};

const STATUS_BORDER_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: '#2563eb',
  CONFIRMED: '#16a34a',
  IN_PROGRESS: '#ca8a04',
  COMPLETED: '#16a34a',
  CANCELLED: '#4b5563',
  NO_SHOW: '#dc2626',
};

export function AppointmentCalendar({
  appointments,
  stylistFilter,
  onEventClick,
  onDatesChange,
}: AppointmentCalendarProps) {
  const [viewType, setViewType] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('timeGridWeek');

  // Transform appointments to FullCalendar event format
  const events: EventInput[] = appointments
    .filter((appointment) => !stylistFilter || appointment.stylistId === stylistFilter)
    .map((appointment) => ({
      id: appointment.id,
      title: `${appointment.client.user.firstName} ${appointment.client.user.lastName}`,
      start: appointment.scheduledStart,
      end: appointment.scheduledEnd,
      backgroundColor: STATUS_COLORS[appointment.status],
      borderColor: STATUS_BORDER_COLORS[appointment.status],
      classNames: ['cursor-pointer', 'hover:opacity-80', 'transition-opacity'],
      extendedProps: {
        appointment,
      },
    }));

  const handleEventClick = (arg: EventClickArg) => {
    const appointment = arg.event.extendedProps.appointment as Appointment;
    if (onEventClick) {
      onEventClick(appointment);
    }
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    if (onDatesChange) {
      onDatesChange(arg.start, arg.end);
    }
  };

  return (
    <div className="fc-wrapper">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewType('dayGridMonth')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              viewType === 'dayGridMonth'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewType('timeGridWeek')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              viewType === 'timeGridWeek'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewType('timeGridDay')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              viewType === 'timeGridDay'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-500"></div>
            <span className="text-gray-600">Cancelled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">No Show</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={viewType}
          events={events}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '',
          }}
          height={700}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
          dayMaxEvents={true}
          weekends={true}
          editable={false}
          selectable={false}
        />
      </div>
    </div>
  );
}
