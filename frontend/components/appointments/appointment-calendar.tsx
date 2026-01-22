'use client';

import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput, EventClickArg, DatesSetArg } from '@fullcalendar/core';
import type { ResourceInput } from '@fullcalendar/resource';
import type { Appointment, AppointmentStatus, Stylist } from '@/types';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  stylists?: Stylist[];
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

type ViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'resourceTimelineWeek' | 'resourceTimelineDay';

export function AppointmentCalendar({
  appointments,
  stylists = [],
  stylistFilter,
  onEventClick,
  onDatesChange,
}: AppointmentCalendarProps) {
  const [viewType, setViewType] = useState<ViewType>('resourceTimelineWeek');
  const calendarRef = useRef<FullCalendar>(null);

  // Update calendar view when viewType changes
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(viewType);
    }
  }, [viewType]);

  // Filter stylists based on selection
  const filteredStylists = stylistFilter
    ? stylists.filter(s => s.id === stylistFilter)
    : stylists;

  // Transform stylists to FullCalendar resource format
  const resources: ResourceInput[] = filteredStylists.map((stylist) => ({
    id: stylist.id,
    title: `${stylist.user.firstName} ${stylist.user.lastName}`,
  }));

  // Transform appointments to FullCalendar event format
  const events: EventInput[] = appointments
    .filter((appointment) => !stylistFilter || appointment.stylistId === stylistFilter)
    .map((appointment) => ({
      id: appointment.id,
      title: `${appointment.client.user.firstName} ${appointment.client.user.lastName}`,
      start: appointment.scheduledStart,
      end: appointment.scheduledEnd,
      resourceId: appointment.stylistId,
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

  const isResourceView = viewType.startsWith('resourceTimeline');

  return (
    <>
      <style>{`
        .fc-wrapper .fc {
          font-family: inherit;
        }
        .fc-wrapper .fc-toolbar-title {
          color: #111827;
          font-size: 1.25rem;
          font-weight: 600;
        }
        .fc-wrapper .fc-button-primary {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        .fc-wrapper .fc-button-primary:hover {
          background-color: #2563eb;
          border-color: #2563eb;
        }
        .fc-wrapper .fc-col-header-cell-cushion,
        .fc-wrapper .fc-daygrid-day-number {
          color: #374151;
          font-weight: 500;
        }
        .fc-wrapper .fc-day-today .fc-daygrid-day-number {
          color: #111827;
          font-weight: 700;
        }
        .fc-wrapper .fc-timegrid-slot-label-cushion,
        .fc-wrapper .fc-timegrid-axis-cushion {
          color: #374151;
        }
        .fc-wrapper .fc-event-title,
        .fc-wrapper .fc-event-time {
          color: #ffffff;
          font-weight: 500;
        }
        .fc-wrapper .fc-timeline-header-cell {
          color: #374151;
          font-weight: 500;
        }
        .fc-wrapper .fc-resource-cell {
          color: #111827;
          font-weight: 600;
        }
        .fc-wrapper .fc-timeline-lane .fc-timeline-events {
          background-color: #f9fafb;
        }
        .fc-wrapper .fc-timeline-slot {
          border-color: #e5e7eb;
        }
      `}</style>
      <div className="fc-wrapper">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setViewType('resourceTimelineWeek')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                viewType === 'resourceTimelineWeek'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Team (Week)
            </button>
            <button
              onClick={() => setViewType('resourceTimelineDay')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                viewType === 'resourceTimelineDay'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Team (Day)
            </button>
            <div className="w-px bg-gray-300"></div>
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

          <div className="flex flex-wrap items-center gap-4 text-sm">
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

        {isResourceView && filteredStylists.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-12">
            <div className="text-gray-500">No stylists available</div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, resourceTimelinePlugin, interactionPlugin]}
              initialView={viewType}
              events={events}
              resources={isResourceView ? resources : undefined}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: '',
              }}
              height={isResourceView ? Math.max(700, filteredStylists.length * 120) : 700}
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short',
              }}
              dayMaxEvents={true}
              weekends={true}
              editable={false}
              selectable={false}
              resourceAreaHeaderContent="Stylist"
              resourceAreaWidth={150}
              slotDuration="00:30:00"
              slotLabelFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short',
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
