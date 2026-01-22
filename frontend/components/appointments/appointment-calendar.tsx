'use client';

import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput, EventClickArg, DatesSetArg, EventDropArg } from '@fullcalendar/core';
import type { ResourceInput } from '@fullcalendar/resource';
import type { Appointment, AppointmentStatus, Stylist } from '@/types';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  stylists?: Stylist[];
  stylistFilter?: string;
  onEventClick?: (appointment: Appointment) => void;
  onEventDrop?: (appointmentId: string, newStart: Date, newEnd: Date, newResourceId?: string) => Promise<void>;
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

// Can only edit appointments that are SCHEDULED, CONFIRMED, or IN_PROGRESS
const EDITABLE_STATUSES = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] as const;

export function AppointmentCalendar({
  appointments,
  stylists = [],
  stylistFilter,
  onEventClick,
  onEventDrop,
  onDatesChange,
}: AppointmentCalendarProps) {
  const [viewType, setViewType] = useState<ViewType>('resourceTimelineWeek');
  const [snapMinutes, setSnapMinutes] = useState<number>(15);
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
    .map((appointment) => {
      const isEditable = EDITABLE_STATUSES.includes(appointment.status as any);
      return {
        id: appointment.id,
        title: `${appointment.client.user.firstName} ${appointment.client.user.lastName}`,
        start: appointment.scheduledStart,
        end: appointment.scheduledEnd,
        resourceId: appointment.stylistId,
        backgroundColor: STATUS_COLORS[appointment.status],
        borderColor: STATUS_BORDER_COLORS[appointment.status],
        classNames: [
          'cursor-pointer',
          'hover:opacity-80',
          'transition-opacity',
          isEditable ? 'cursor-move' : 'cursor-pointer',
        ],
        editable: isEditable,
        durationEditable: isEditable,
        startEditable: isEditable,
        extendedProps: {
          appointment,
        },
      };
    });

  const handleEventClick = (arg: EventClickArg) => {
    const appointment = arg.event.extendedProps.appointment as Appointment;
    if (onEventClick) {
      onEventClick(appointment);
    }
  };

  const handleEventDrop = async (arg: EventDropArg) => {
    const appointment = arg.event.extendedProps.appointment as Appointment;

    // Revert the change initially (we'll update if the API call succeeds)
    arg.revert();

    if (!onEventDrop) return;

    try {
      const newStart = arg.event.start as Date;
      const newEnd = arg.event.end as Date;
      const newResourceId = arg.newResource?.id;

      await onEventDrop(appointment.id, newStart, newEnd, newResourceId);
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  const handleEventResize = async (arg: any) => {
    const appointment = arg.event.extendedProps.appointment as Appointment;

    // Revert the change initially
    arg.revert();

    if (!onEventDrop) return;

    try {
      const newStart = arg.event.start as Date;
      const newEnd = arg.event.end as Date;

      await onEventDrop(appointment.id, newStart, newEnd, appointment.stylistId);
    } catch (error) {
      console.error('Failed to update appointment:', error);
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
          color: #000000;
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
          color: #000000;
          font-weight: 500;
        }
        .fc-wrapper .fc-day-today .fc-daygrid-day-number {
          color: #000000;
          font-weight: 700;
        }
        .fc-wrapper .fc-timegrid-slot-label-cushion,
        .fc-wrapper .fc-timegrid-axis-cushion {
          color: #000000;
        }
        .fc-wrapper .fc-event-title,
        .fc-wrapper .fc-event-time {
          color: #ffffff;
          font-weight: 500;
        }
        .fc-wrapper .fc-timeline-header-cell {
          color: #000000;
          font-weight: 500;
        }
        .fc-wrapper .fc-resource-cell {
          color: #000000;
          font-weight: 600;
        }
        .fc-wrapper .fc-timeline-lane .fc-timeline-events {
          background-color: #f9fafb;
        }
        .fc-wrapper .fc-timeline-slot {
          border-color: #e5e7eb;
        }
        .fc-wrapper .fc-timeline-slot-mini {
          color: #000000;
        }
        .fc-wrapper .fc-datagrid-cell {
          color: #000000;
        }
        /* Google Calendar-style event styling */
        .fc-wrapper .fc-event {
          border-radius: 4px;
          border-left-width: 4px;
          padding: 2px 4px;
        }
        .fc-wrapper .fc-event:hover {
          opacity: 0.85;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        /* Drag handle cursor */
        .fc-wrapper .fc-event.fc-event-dragging {
          opacity: 0.7;
        }
        .fc-wrapper .fc-event .fc-event-resizer {
          cursor: ns-resize;
          width: 8px;
        }
        .fc-wrapper .fc-event .fc-event-resizer-start {
          cursor: move;
        }
        .fc-wrapper .fc-event .fc-event-resizer-end {
          cursor: s-resize;
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
              <label className="text-gray-600">Snap:</label>
              <select
                value={snapMinutes}
                onChange={(e) => setSnapMinutes(Number(e.target.value))}
                className="rounded border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
              </select>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
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
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
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
              editable={true}
              selectable={false}
              snapDuration={`${snapMinutes}:00`}
              slotDuration="00:15:00"
              resourceAreaHeaderContent="Stylist"
              resourceAreaWidth={150}
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
