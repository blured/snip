declare module '@toast-ui/calendar' {
  export interface EventObject {
    id: string;
    calendarId: string;
    title: string;
    category?: 'time' | 'allday' | 'task';
    start: Date | string;
    end: Date | string;
    isReadOnly?: boolean;
    backgroundColor?: string;
    borderColor?: string;
    color?: string;
    customStyle?: Record<string, any>;
    raw?: any;
    [key: string]: any;
  }

  export interface Options {
    defaultView?: 'day' | 'week' | 'month';
    useFormPopup?: boolean;
    useDetailPopup?: boolean;
    isReadOnly?: boolean;
    week?: {
      startDayOfWeek?: number;
      dayNames?: string[];
      hourStart?: number;
      hourEnd?: number;
      taskView?: boolean;
      eventView?: string[];
      collapseDuplicateEvents?: any;
    };
    month?: {
      startDayOfWeek?: number;
      dayNames?: string[];
      visibleWeeksCount?: number;
    };
    timezone?: {
      zones?: any[];
    };
    theme?: any;
    gridSelection?: boolean;
    template?: any;
  }

  export class Calendar {
    constructor(container: HTMLElement, options?: Options);
    changeView(view: 'day' | 'week' | 'month'): void;
    createEvents(events: EventObject[]): void;
    updateEvent(eventId: string, changes: Partial<EventObject>): void;
    deleteEvent(eventId: string): void;
    clear(): void;
    destroy(): void;
  }
}

declare module '@toast-ui/react-calendar' {
  import type { Calendar as TUICalendar, EventObject, Options } from '@toast-ui/calendar';
  import type { Component } from 'react';

  export { EventObject, Options };

  export interface CalendarProps extends Partial<Options> {
    height?: string;
    view?: 'day' | 'week' | 'month';
    calendars?: Array<{
      id: string;
      name: string;
      backgroundColor?: string;
      borderColor?: string;
      dragBackgroundColor?: string;
    }>;
    events?: Array<EventObject>;
    onClickEvent?: (info: { event: EventObject; nativeEvent: MouseEvent }) => void;
    onBeforeCreateEvent?: (eventData: {
      start: Date;
      end: Date;
      isAllday: boolean;
      calendarId?: string;
    }) => boolean | void;
    onBeforeUpdateEvent?: (updateData: {
      event: EventObject;
      changes: Partial<EventObject>;
    }) => boolean | void | Promise<boolean | void>;
    [key: string]: any;
  }

  export default class Calendar extends Component<CalendarProps> {
    getInstance(): TUICalendar | null;
  }
}
