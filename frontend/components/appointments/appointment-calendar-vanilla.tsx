'use client';

import React, { useEffect, useRef } from 'react';
import TUICalendar from '@toast-ui/calendar';
import type { EventObject, Options } from '@toast-ui/calendar';
import type { Appointment, AppointmentStatus } from '@/types';
import type { AppointmentCalendarProps } from './appointment-calendar-types';

// TypeScript workaround for TUI Calendar constructor
const Calendar = TUICalendar as any;

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

export function AppointmentCalendarVanilla({
  appointments,
  stylists = [],
  stylistFilter,
  calendarSettings,
  onEventClick,
  onEventDrop,
  onStylistFilterChange,
  onAppointmentCreate,
}: AppointmentCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<any>(null);

  // Initialize calendar
  useEffect(() => {
    if (!containerRef.current) return;

    const view = calendarSettings?.currentView || 'week';
    const startHour = parseInt(calendarSettings?.startHour?.split(':')[0] || '9');
    const endHour = parseInt(calendarSettings?.endHour?.split(':')[0] || '18');
    const firstDayOfWeek = calendarSettings?.firstDayOfWeek || 1;

    const options: Options = {
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
      },
      month: {
        startDayOfWeek: firstDayOfWeek,
        dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
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
          nowIndicatorLabel: { color: '#7575FF' },
          nowIndicatorPast: { border: '1px dashed #7575FF' },
          nowIndicatorBullet: { backgroundColor: '#7575FF' },
          nowIndicatorToday: { border: '1px solid #7575FF' },
          gridSelection: {
            backgroundColor: 'rgba(117, 117, 255, 0.1)',
            border: '1px solid #7575FF',
          },
        },
      },
      gridSelection: true,
      template: {
        time(event: EventObject) {
          return `<span style="color: white; font-weight: 500;">${event.title}</span>`;
        },
      },
    };

    const calendar = new Calendar(containerRef.current, options);
    calendarRef.current = calendar;

    // Set up calendars (stylists)
    calendar.setCalendars(
      stylists.map((stylist, index) => ({
        id: stylist.id,
        name: `${stylist.user.firstName} ${stylist.user.lastName}`,
        backgroundColor: STYLIST_COLORS[index % STYLIST_COLORS.length],
        borderColor: STYLIST_COLORS[index % STYLIST_COLORS.length],
        dragBackgroundColor: STYLIST_COLORS[index % STYLIST_COLORS.length],
      }))
    );

    // Event handlers
    calendar.on('clickEvent', (info) => {
      const appointment = appointments.find((a) => a.id === info.event.id);
      if (appointment && onEventClick) {
        onEventClick(appointment);
      }
    });

    calendar.on('beforeCreateEvent', (eventData) => {
      if (onAppointmentCreate) {
        onAppointmentCreate({
          startTime: eventData.start.toDate(),
          endTime: eventData.end.toDate(),
          stylistId: eventData.calendarId || stylistFilter || undefined,
        });
      }
      return false; // Prevent default event creation
    });

    calendar.on('beforeUpdateEvent', async ({ event, changes }) => {
      if (onEventDrop) {
        const newStart = changes.start ? changes.start.toDate() : event.start.toDate();
        const newEnd = changes.end ? changes.end.toDate() : event.end.toDate();
        const newCalendarId = changes.calendarId || event.calendarId;

        try {
          await onEventDrop(event.id, newStart, newEnd, newCalendarId);
        } catch (error) {
          console.error('Failed to update appointment:', error);
        }
      }
      return false; // We handle updates via API
    });

    return () => {
      calendar.destroy();
    };
  }, [stylists.length, calendarSettings]);

  // Update events when appointments change
  useEffect(() => {
    if (!calendarRef.current) return;

    const filteredAppointments = stylistFilter
      ? appointments.filter((a) => a.stylistId === stylistFilter)
      : appointments;

    const events = filteredAppointments.map((appointment) => {
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
      };
    });

    calendarRef.current.clear();
    calendarRef.current.createEvents(events);
  }, [appointments, stylistFilter]);

  // Update view when settings change
  useEffect(() => {
    if (calendarRef.current && calendarSettings?.currentView) {
      calendarRef.current.changeView(calendarSettings.currentView);
    }
  }, [calendarSettings?.currentView]);

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
        <div className="calendar-main" ref={containerRef} style={{ height: '750px' }} />

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
            <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>Appointments with time conflicts appear here.</p>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                Drag conflicted appointments to the calendar to reschedule.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
