'use client';

import React from 'react';
import Calendar from '@toast-ui/react-calendar';
import type { EventObject, Options } from '@toast-ui/calendar';
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

// Stylist colors for calendar visual grouping
const STYLIST_COLORS = [
  '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
];

// Can only edit appointments that are SCHEDULED, CONFIRMED, or IN_PROGRESS
const EDITABLE_STATUSES = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] as const;

export function AppointmentCalendarImpl({
  appointments,
  stylists = [],
  stylistFilter,
  calendarSettings,
  onEventClick,
  onEventDrop,
  onStylistFilterChange,
  onAppointmentCreate,
}: AppointmentCalendarProps) {
  const calendarRef = React.useRef<Calendar>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const [calendarKey, setCalendarKey] = React.useState(0);

  // Ensure component only renders on client-side
  React.useEffect(() => {
    // Small delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Force remount when appointments or stylists change to prevent DOM conflicts
  React.useEffect(() => {
    if (isMounted) {
      setCalendarKey(prev => prev + 1);
    }
  }, [appointments.length, stylists.length, isMounted]);

  // Transform stylists to TUI calendars
  const calendars = React.useMemo(() => {
    return stylists.map((stylist, index) => ({
      id: stylist.id,
      name: `${stylist.user.firstName} ${stylist.user.lastName}`,
      backgroundColor: STYLIST_COLORS[index % STYLIST_COLORS.length],
      borderColor: STYLIST_COLORS[index % STYLIST_COLORS.length],
      dragBackgroundColor: STYLIST_COLORS[index % STYLIST_COLORS.length],
    }));
  }, [stylists]);

  // Filter appointments based on stylist filter
  const filteredAppointments = React.useMemo(() => {
    return stylistFilter
      ? appointments.filter((a) => a.stylistId === stylistFilter)
      : appointments;
  }, [appointments, stylistFilter]);

  // Transform appointments to TUI events
  const events = React.useMemo(() => {
    return filteredAppointments.map((appointment) => {
      const isEditable = EDITABLE_STATUSES.includes(appointment.status as any);
      const statusColor = STATUS_COLORS[appointment.status];

      return {
        id: appointment.id,
        calendarId: appointment.stylistId,
        title: `${appointment.client.user.firstName} ${appointment.client.user.lastName}`,
        category: 'time' as const,
        start: new Date(appointment.scheduledStart),
        end: new Date(appointment.scheduledEnd),
        isReadOnly: !isEditable,
        backgroundColor: statusColor,
        borderColor: statusColor,
        color: '#ffffff',
        customStyle: {
          fontSize: '13px',
          fontWeight: '500',
        },
        raw: appointment, // Store original appointment for click handler
      };
    });
  }, [filteredAppointments]);

  // Handle clicking on an event
  const handleClickEvent = React.useCallback(
    (info: { event: EventObject; nativeEvent: MouseEvent }) => {
      const appointment = filteredAppointments.find((a) => a.id === info.event.id);
      if (appointment && onEventClick) {
        onEventClick(appointment);
      }
    },
    [filteredAppointments, onEventClick]
  );

  // Handle creating new event by clicking empty space
  const handleBeforeCreateEvent = React.useCallback(
    (eventData: {
      start: Date;
      end: Date;
      isAllday: boolean;
      calendarId?: string;
    }) => {
      if (onAppointmentCreate) {
        onAppointmentCreate({
          startTime: eventData.start,
          endTime: eventData.end,
          stylistId: eventData.calendarId || stylistFilter || undefined,
        });
      }
      return false; // Prevent default event creation
    },
    [onAppointmentCreate, stylistFilter]
  );

  // Handle drag/drop or resize event
  const handleBeforeUpdateEvent = React.useCallback(
    async (updateData: {
      event: EventObject;
      changes: Partial<EventObject>;
    }) => {
      const { event, changes } = updateData;

      if (onEventDrop) {
        const newStart = changes.start || event.start;
        const newEnd = changes.end || event.end;
        const newCalendarId = changes.calendarId || event.calendarId;

        try {
          await onEventDrop(
            event.id,
            newStart as Date,
            newEnd as Date,
            newCalendarId as string
          );
        } catch (error) {
          console.error('Failed to update appointment:', error);
        }
      }

      return false; // We handle updates via API, prevent default
    },
    [onEventDrop]
  );

  // Calendar options
  const calendarOptions = React.useMemo<Options>(() => {
    const view = calendarSettings?.currentView || 'week';
    const startHour = parseInt(calendarSettings?.startHour?.split(':')[0] || '9');
    const endHour = parseInt(calendarSettings?.endHour?.split(':')[0] || '18');
    const firstDayOfWeek = calendarSettings?.firstDayOfWeek || 1;

    return {
      defaultView: view,
      useFormPopup: false,
      useDetailPopup: false,
      isReadOnly: false,
      week: {
        startDayOfWeek: firstDayOfWeek,
        dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        hourStart: startHour,
        hourEnd: endHour,
        taskView: false,
        eventView: ['time'],
        collapseDuplicateEvents: {
          getDuplicateEvents: (targetEvent: EventObject, events: EventObject[]) => {
            return events.filter(event =>
              event.calendarId === targetEvent.calendarId &&
              new Date(event.start).getTime() === new Date(targetEvent.start).getTime()
            );
          },
          getMainEvent: (events: EventObject[]) => events[0],
        },
      },
      month: {
        startDayOfWeek: firstDayOfWeek,
        dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        visibleWeeksCount: 0, // Auto-calculate
      },
      timezone: {
        zones: [],
      },
      theme: {
        common: {
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          holiday: { color: '#ef4444' },
          saturday: { color: '#374151' },
          dayName: { color: '#374151' },
          today: { color: '#7575FF' },
        },
        week: {
          today: {
            color: '#7575FF',
            backgroundColor: 'rgba(117, 117, 255, 0.05)',
          },
          pastDay: { color: '#9ca3af' },
          panelResizer: { border: '1px solid #e5e7eb' },
          dayName: {
            borderLeft: 'none',
            borderTop: '1px solid #e5e7eb',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
          },
          weekend: { backgroundColor: '#f9fafb' },
          nowIndicatorLabel: { color: '#7575FF' },
          nowIndicatorPast: { border: '1px dashed #7575FF' },
          nowIndicatorBullet: { backgroundColor: '#7575FF' },
          nowIndicatorToday: { border: '1px solid #7575FF' },
          nowIndicatorFuture: { border: 'none' },
          pastTime: { color: '#9ca3af' },
          futureTime: { color: '#374151' },
          gridSelection: {
            backgroundColor: 'rgba(117, 117, 255, 0.1)',
            border: '1px solid #7575FF',
          },
        },
        month: {
          dayName: {
            borderLeft: 'none',
            backgroundColor: '#f9fafb',
          },
          holidayExceptThisMonth: { color: '#f87171' },
          dayExceptThisMonth: { color: '#d1d5db' },
          weekend: { backgroundColor: '#f9fafb' },
          moreView: {
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 6px 0 rgba(0, 0, 0, 0.1)',
            backgroundColor: '#ffffff',
            width: 320,
            height: 200,
          },
          moreViewTitle: {
            backgroundColor: '#f9fafb',
          },
          gridCell: {
            headerHeight: 40,
            footerHeight: 10,
          },
        },
      },
      gridSelection: true,
      template: {
        time(event: EventObject) {
          return `<span style="color: white; font-weight: 500;">${event.title}</span>`;
        },
        allday(event: EventObject) {
          return `<span style="color: white; font-weight: 500;">${event.title}</span>`;
        },
      },
    };
  }, [calendarSettings]);

  // Update calendar view when settings change
  React.useEffect(() => {
    if (calendarRef.current && isMounted) {
      const calendarInstance = calendarRef.current.getInstance();
      if (calendarInstance && calendarSettings?.currentView) {
        calendarInstance.changeView(calendarSettings.currentView);
      }
    }
  }, [calendarSettings?.currentView, isMounted]);

  // Don't render until mounted on client
  if (!isMounted) {
    return (
      <div className="calendar-wrapper">
        <div className="calendar-layout">
          <div className="calendar-main" style={{ padding: '50px', textAlign: 'center' }}>
            <p>Loading calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-wrapper">
      <style>{`
        .calendar-wrapper {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          background: linear-gradient(-141deg, #FBFAFF 14%, #FBFAFF 100%);
          min-height: calc(100vh - 120px);
        }

        .calendar-layout {
          display: flex;
          gap: 24px;
          padding: 30px 50px;
        }

        .calendar-main {
          flex: 1;
          min-width: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .calendar-sidebar {
          width: 280px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .sidebar-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .sidebar-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }

        .stylist-filter {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
          color: #374151;
          background: white;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .stylist-filter:hover {
          border-color: #7575FF;
        }

        .stylist-filter:focus {
          outline: none;
          border-color: #7575FF;
          box-shadow: 0 0 0 3px rgba(117, 117, 255, 0.1);
        }

        .waiting-list-content {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.6;
        }

        /* TUI Calendar customization */
        .toastui-calendar-template-time {
          padding: 4px 8px !important;
        }

        /* Mobile responsive */
        @media (max-width: 1024px) {
          .calendar-layout {
            flex-direction: column;
            padding: 20px;
          }

          .calendar-sidebar {
            width: 100%;
          }
        }
      `}</style>

      <div className="calendar-layout">
        <div className="calendar-main" ref={containerRef} suppressHydrationWarning>
          <Calendar
            key={`calendar-${calendarKey}`}
            ref={calendarRef}
            height="750px"
            calendars={calendars}
            events={events}
            {...calendarOptions}
            onClickEvent={handleClickEvent}
            onBeforeCreateEvent={handleBeforeCreateEvent}
            onBeforeUpdateEvent={handleBeforeUpdateEvent}
          />
        </div>

        {/* Right Sidebar */}
        <div className="calendar-sidebar">
          {/* Stylist Filter */}
          {onStylistFilterChange && (
            <div className="sidebar-section">
              <label className="sidebar-title">Filter by Stylist</label>
              <select
                className="stylist-filter"
                value={stylistFilter || ''}
                onChange={(e) => onStylistFilterChange(e.target.value)}
              >
                <option value="">All Stylists</option>
                {stylists.map((stylist) => (
                  <option key={stylist.id} value={stylist.id}>
                    {stylist.user.firstName} {stylist.user.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Waiting List Section */}
          <div className="sidebar-section">
            <div className="sidebar-title">Waiting List</div>
            <div className="waiting-list-content">
              <p className="mb-2">Appointments with time conflicts appear here.</p>
              <p className="text-xs text-gray-400">
                Drag conflicted appointments to the calendar to reschedule.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
