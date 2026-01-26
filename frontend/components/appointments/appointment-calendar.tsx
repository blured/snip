'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { AppointmentCalendarProps } from './appointment-calendar-types';

// Dynamic import using FullCalendar implementation
const DynamicCalendar = dynamic(
  () => import('./appointment-calendar-impl').then(mod => mod.AppointmentCalendarImpl),
  {
    ssr: false,
    loading: () => (
      <div className="calendar-wrapper">
        <div className="calendar-layout">
          <div className="calendar-main" style={{ padding: '50px', textAlign: 'center' }}>
            <p>Loading calendar...</p>
          </div>
        </div>
      </div>
    ),
  }
);

export function AppointmentCalendar(props: AppointmentCalendarProps) {
  return <DynamicCalendar {...props} />;
}
