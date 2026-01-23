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
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
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
  onStylistFilterChange?: (stylistId: string) => void;
}

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: '#3b82f6',
  CONFIRMED: '#22c55e',
  IN_PROGRESS: '#eab308',
  COMPLETED: '#22c55e',
  CANCELLED: '#6b7280',
  NO_SHOW: '#ef4444',
};

// Syncfusion purple theme colors
const PRIMARY_COLOR = '#7575FF';
const HOVER_COLOR = '#f5f5f5';

type AppointmentData = {
  Id: string;
  Subject: string;
  StartTime: Date;
  EndTime: Date;
  StylistId: string;
  IsReadonly?: boolean;
  CategoryColor: string;
  Status: AppointmentStatus;
  Description?: string;
  Location?: string;
};

type StylistResource = {
  Id: string;
  Text: string;
  Name: string;
  Designation: string;
  Image: string;
  Color: string;
  GroupID: string;
};

// Can only edit appointments that are SCHEDULED, CONFIRMED, or IN_PROGRESS
const EDITABLE_STATUSES = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] as const;

export function AppointmentCalendar({
  appointments,
  stylists = [],
  stylistFilter,
  onEventClick,
  onEventDrop,
  onStylistFilterChange,
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

  // Transform stylists to Syncfusion resource format with departments
  const departments = [
    {
      Id: '1',
      Text: 'All Stylists',
      Name: 'All Stylists',
      Designation: 'All Departments',
      Image: '',
      Color: PRIMARY_COLOR,
      GroupID: '',
    },
  ];

  const resourcesData: StylistResource[] = [
    ...departments,
    ...filteredStylists.map((stylist, index) => ({
      Id: stylist.id,
      Text: `${stylist.user.firstName} ${stylist.user.lastName}`,
      Name: `${stylist.user.firstName} ${stylist.user.lastName}`,
      Designation: 'Stylist',
      Image: 'https://ej2.syncfusion.com/demos/src/schedule/images/football.svg',
      Color: stylistColors[index % stylistColors.length],
      GroupID: '1',
    })),
  ];

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

  // Stylist dropdown fields
  const specialistFields = {
    text: 'Text',
    value: 'Id',
    iconCss: 'e-caret e-icons',
    groupBy: 'GroupID',
  };

  const specialistTemplate = (props: any) => {
    if (props.Name === 'All Stylists') {
      return (
        <div className="template-wrap">
          <div className="specialist-name" style={{ color: '#7575FF' }}>
            {props.Text}
          </div>
          <div className="specialist-role" style={{ fontSize: '12px', color: '#666' }}>
            All stylists combined
          </div>
        </div>
      );
    }
    return (
      <div className="template-wrap">
        <div className="specialist-image">
          <img
            src={props.Image}
            alt={props.Name}
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          />
        </div>
        <div className="specialist-info">
          <div className="specialist-name" style={{ color: '#333' }}>
            {props.Name}
          </div>
          <div className="specialist-role" style={{ fontSize: '12px', color: '#666' }}>
            {props.Designation}
          </div>
        </div>
      </div>
    );
  };

  const fieldMapping = {
    id: 'Id',
    subject: { name: 'Subject', title: 'Client' },
    startTime: { name: 'StartTime', title: 'Start Time' },
    endTime: { name: 'EndTime', title: 'End Time' },
    location: { name: 'Location', title: 'Stylist' },
  };

  return (
    <div className="planner-calendar-wrapper">
      <style>{`
        /* Syncfusion Planner Theme */
        .planner-calendar-wrapper {
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif, -apple-system, BlinkMacSystemFont;
          letter-spacing: 0.05px;
          background: linear-gradient(-141deg, #FBFAFF 14%, #FBFAFF 100%);
        }

        .planner-calendar-wrapper .e-schedule .e-schedule-toolbar .e-schedule-toolbar-container {
          background: white;
          border-bottom: 1px solid #e0e0e0;
        }

        .planner-calendar-wrapper .e-schedule .e-resource-cells {
          background-color: white;
          border: none;
          border-right: 1px solid #e0e0e0;
        }

        .planner-calendar-wrapper .e-schedule .e-header-cells .e-header-cell {
          text-align: center;
          color: #333;
          font-size: 13px;
          font-weight: 500;
        }

        .planner-calendar-wrapper .e-schedule .e-date-header-wrap {
          background: white;
        }

        .planner-calendar-wrapper .e-schedule .e-header-container {
          border-bottom: 1px solid #e0e0e0;
          border-left: none !important;
          border-right: none !important;
        }

        .planner-calendar-wrapper .e-schedule .e-active-view .e-active-view-header {
          color: #7575FF;
          font-weight: 600;
        }

        .planner-calendar-wrapper .e-schedule .e-active-view:hover .e-active-view-header {
          color: #7575FF;
        }

        .planner-calendar-wrapper .e-schedule .e-header-cells {
          font-weight: 500;
        }

        .planner-calendar-wrapper .e-schedule .e-work-cells {
          background-color: white;
        }

        .planner-wrapper {
          display: flex;
          justify-content: space-between;
          margin: 30px 50px;
        }

        .drag-sample-wrapper {
          display: flex;
          justify-content: space-between;
        }

        .schedule-container {
          width: 85%;
          padding-right: 25px;
        }

        .sidebar-right {
          width: 15%;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .template-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .specialist-image img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        .specialist-name {
          font-size: 13px;
          font-weight: 500;
        }

        .specialist-role {
          font-size: 12px;
          color: #666;
        }

        .waiting-list-title {
          margin-top: 45px;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        /* Appointment styling */
        .e-schedule .e-appointment {
          border-radius: 4px;
        }

        /* Mobile responsive */
        @media (max-width: 850px) {
          .planner-wrapper {
            margin: 20px 10px !important;
          }

          .schedule-container {
            width: 100% !important;
            padding-right: 0 !important;
          }

          .sidebar-right {
            width: 100% !important;
          }
        }

        /* Specialist dropdown */
        .planner-calendar-wrapper .e-dropdown-popup {
          max-height: 400px;
        }

        .planner-calendar-wrapper .e-list-item {
          height: 65px;
          padding: 0 15px;
          margin: 5px 0;
        }

        .planner-calendar-wrapper .e-list-item:hover {
          background-color: ${HOVER_COLOR};
        }
      `}</style>
      <div className="drag-sample-wrapper">
        <div className="schedule-container">
          <ScheduleComponent
            ref={scheduleObj}
            width="100%"
            height={800}
            selectedDate={new Date()}
            currentView="TimelineWeek"
            eventSettings={{
              dataSource: data as any,
              fields: fieldMapping,
            }}
            group={{ resources: ['Departments', 'Stylists'] }}
            resources={resourcesData as any}
            allowDragAndDrop={true}
            allowResizing={true}
            showQuickInfo={false}
            actionBegin={onActionBegin}
            actionComplete={onActionComplete}
            popupOpen={onPopupOpen}
            readonly={false}
          >
            <ResourcesDirective>
              <ResourceDirective
                field="StylistId"
                title="Stylist"
                name="Stylists"
                textField="Text"
                idField="Id"
                colorField="Color"
                groupIDField="GroupID"
              />
            </ResourcesDirective>
            <ViewsDirective>
              <ViewDirective option="Day" startHour="09:00" endHour="18:00" />
              <ViewDirective option="Week" startHour="09:00" endHour="18:00" />
              <ViewDirective option="WorkWeek" startHour="09:00" endHour="18:00" />
              <ViewDirective option="Month" />
              <ViewDirective option="TimelineDay" group={{ allowEdit: false }} />
              <ViewDirective option="TimelineWeek" group={{ allowEdit: false }} />
              <ViewDirective option="TimelineWorkWeek" group={{ allowEdit: false }} />
              <ViewDirective option="TimelineMonth" group={{ allowEdit: false }} />
            </ViewsDirective>
            <Inject services={[Day, Week, WorkWeek, Month, TimelineViews, TimelineMonth]} />
          </ScheduleComponent>
        </div>

        {/* Right Sidebar with Specialist Dropdown and Waiting List */}
        <div className="sidebar-right">
          {/* Specialist Dropdown */}
          <DropDownListComponent
            id="specialistDropdown"
            dataSource={resourcesData.filter((r) => r.Id !== '1') as any[]}
            fields={specialistFields as any}
            placeholder="Select Specialist"
            value={stylistFilter || '1'}
            headerTemplate={specialistTemplate as any}
            itemTemplate={specialistTemplate as any}
            popupHeight="400px"
            cssClass="specialist-dropdown"
            change={(args: any) => {
              // Handle stylist filter change
              const selectedId = args.itemData?.Id || args.value;
              if (onStylistFilterChange && selectedId) {
                onStylistFilterChange(selectedId === '1' ? '' : selectedId);
              }
            }}
          />

          {/* Waiting List Section */}
          <div className="waiting-list-section">
            <div className="waiting-list-title">Waiting List</div>
            <div className="waiting-list-content">
              <div className="text-sm text-gray-500">
                Conflicted appointments can be dragged to the calendar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
