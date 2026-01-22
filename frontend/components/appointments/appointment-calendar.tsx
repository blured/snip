'use client';

import * as React from 'react';
import { registerLicense } from '@syncfusion/ej2-base';
import {
  ScheduleComponent,
  ViewsDirective,
  ViewDirective,
  Day,
  Week,
  WorkWeek,
  Month,
  TimelineViews,
  TimelineMonth,
  ResourcesDirective,
  ResourceDirective,
  Inject,
} from '@syncfusion/ej2-react-schedule';
import { extend } from '@syncfusion/ej2-base';
import type { Appointment, AppointmentStatus, Stylist } from '@/types';

// Register Syncfusion license for development
registerLicense('ORg4AjUWIQA/Gnt2VVhiQlFac1pbWlHfFpVFpbWlpXCVJVFRPAH0AQEA1UVNVVVPXVNDVUdUR0c=');

// Import Syncfusion CSS
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-calendars/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-react-schedule/styles/material.css';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  stylists?: Stylist[];
  stylistFilter?: string;
  onEventClick?: (appointment: Appointment) => void;
  onEventDrop?: (
    appointmentId: string,
    newStart: Date,
    newEnd: Date,
    newResourceId?: string
  ) => Promise<void>;
}

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: '#3b82f6',
  CONFIRMED: '#22c55e',
  IN_PROGRESS: '#eab308',
  COMPLETED: '#22c55e',
  CANCELLED: '#6b7280',
  NO_SHOW: '#ef4444',
};

type AppointmentData = {
  Id: string;
  Subject: string;
  StartTime: Date;
  EndTime: Date;
  StylistId: string;
  IsReadonly?: boolean;
  CategoryColor: string;
  Status: AppointmentStatus;
  Location?: string;
};

type StylistResource = {
  Id: string;
  Text: string;
  Color: string;
};

// Can only edit appointments that are SCHEDULED, CONFIRMED, or IN_PROGRESS
const EDITABLE_STATUSES = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] as const;

export function AppointmentCalendar({
  appointments,
  stylists = [],
  stylistFilter,
  onEventClick,
  onEventDrop,
}: AppointmentCalendarProps) {
  const scheduleObj = React.useRef<any>(null);

  // Filter stylists based on selection
  const filteredStylists = stylistFilter
    ? stylists.filter((s) => s.id === stylistFilter)
    : stylists;

  // Generate colors for each stylist
  const stylistColors = [
    '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
  ];

  // Transform stylists to Syncfusion resource format
  const resourcesData: StylistResource[] = filteredStylists.map((stylist, index) => ({
    Id: stylist.id,
    Text: `${stylist.user.firstName} ${stylist.user.lastName}`,
    Color: stylistColors[index % stylistColors.length],
  }));

  // Transform appointments to Syncfusion format
  const data: AppointmentData[] = appointments
    .filter((appointment) => !stylistFilter || appointment.stylistId === stylistFilter)
    .map((appointment) => {
      const isEditable = EDITABLE_STATUSES.includes(appointment.status as any);
      return {
        Id: appointment.id,
        Subject: `${appointment.client.user.firstName} ${appointment.client.user.lastName}`,
        StartTime: new Date(appointment.scheduledStart),
        EndTime: new Date(appointment.scheduledEnd),
        StylistId: appointment.stylistId,
        IsReadonly: !isEditable,
        CategoryColor: STATUS_COLORS[appointment.status],
        Status: appointment.status,
        Location: `${appointment.stylist.user.firstName} ${appointment.stylist.user.lastName}`,
      };
    });

  const onActionBegin = (args: any) => {
    if (args.requestType === 'eventCreate') {
      args.cancel = true;
    }
  };

  const onActionComplete = async (args: any) => {
    const validTypes = ['eventChange', 'eventRemoved', 'eventDragged', 'eventResized'];
    if (validTypes.includes(args.requestType) && args.data) {
      const changedData: AppointmentData = Array.isArray(args.data)
        ? args.data[0]
        : args.data;

      if (!onEventDrop) return;

      try {
        await onEventDrop(
          changedData.Id,
          new Date(changedData.StartTime),
          new Date(changedData.EndTime),
          changedData.StylistId
        );
      } catch (error) {
        console.error('Failed to update appointment:', error);
      }
    }
  };

  const onPopupOpen = (args: any) => {
    if (args.type === 'Editor') {
      args.cancel = true;
      if (onEventClick && args.data?.Id) {
        const appointment = appointments.find((a) => a.id === args.data.Id);
        if (appointment) {
          onEventClick(appointment);
        }
      }
    }
  };

  const fieldMapping = {
    id: 'Id',
    subject: { name: 'Subject', title: 'Client' },
    startTime: { name: 'StartTime', title: 'Start Time' },
    endTime: { name: 'EndTime', title: 'End Time' },
    location: { name: 'Location', title: 'Stylist' },
  };

  return (
    <div className="syncfusion-calendar-wrapper">
      <style>{`
        .syncfusion-calendar-wrapper {
          font-family: inherit;
        }
        .syncfusion-calendar-wrapper .e-schedule {
          border: none;
        }
        .syncfusion-calendar-wrapper .e-schedule .e-date-header-wrap {
          background: #f9fafb;
        }
        .syncfusion-calendar-wrapper .e-schedule .e-header-cells {
          color: #000000;
          font-weight: 500;
        }
        .syncfusion-calendar-wrapper .e-schedule .e-day-wrapper .e-appointment {
          border-radius: 4px;
          border-left-width: 4px;
        }
        .syncfusion-calendar-wrapper .e-schedule .e-resource-cells {
          color: #000000;
          font-weight: 600;
        }
        .syncfusion-calendar-wrapper .e-schedule .e-time-cells-wrap,
        .syncfusion-calendar-wrapper .e-schedule .e-work-cells {
          color: #000000;
        }
        .syncfusion-calendar-wrapper .e-schedule .e-current-time {
          color: #000000;
        }
      `}</style>
      <ScheduleComponent
        ref={scheduleObj}
        width="100%"
        height="650px"
        selectedDate={new Date()}
        currentView="TimelineWeek"
        eventSettings={{
          dataSource: data as any,
          fields: fieldMapping,
        }}
        group={{ resources: ['Stylists'] }}
        resources={[resourcesData as any]}
        allowDragAndDrop={true}
        allowResizing={true}
        showQuickInfo={false}
        actionBegin={onActionBegin}
        actionComplete={onActionComplete}
        popupOpen={onPopupOpen}
        readonly={false}
        cssClass="schedule-customization"
      >
        <ResourcesDirective>
          <ResourceDirective field="StylistId" title="Stylist" name="Stylists" textField="Text" idField="Id" colorField="Color" />
        </ResourcesDirective>
        <ViewsDirective>
          <ViewDirective option="Day" startHour="09:00" endHour="18:00" />
          <ViewDirective option="Week" startHour="09:00" endHour="18:00" />
          <ViewDirective option="WorkWeek" startHour="09:00" endHour="18:00" />
          <ViewDirective option="Month" showWeekend={false} />
          <ViewDirective option="TimelineWeek" interval={7} />
          <ViewDirective option="TimelineMonth" />
        </ViewsDirective>
        <Inject
          services={[
            Day,
            Week,
            WorkWeek,
            Month,
            TimelineViews,
            TimelineMonth,
          ]}
        />
      </ScheduleComponent>
    </div>
  );
}
