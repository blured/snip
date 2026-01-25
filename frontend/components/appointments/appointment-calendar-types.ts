import type { Appointment, Stylist } from '@/types';
import type { CalendarSettings } from './calendar-settings-modal';

export interface AppointmentCalendarProps {
  appointments: Appointment[];
  stylists?: Stylist[];
  stylistFilter?: string;
  calendarSettings?: CalendarSettings;
  onEventClick?: (appointment: Appointment) => void;
  onEventDrop?: (
    appointmentId: string,
    newStart: Date,
    newEnd: Date,
    newResourceId?: string
  ) => Promise<void>;
  onStylistFilterChange?: (stylistId: string) => void;
  onAppointmentCreate?: (data: { startTime: Date; endTime: Date; stylistId?: string }) => void;
}
