# Calendar View Implementation Plan

## Summary
Add a new calendar view page at `/dashboard/schedule` using FullCalendar to display all appointments. The calendar will show appointments with color-coding by status, allow filtering by stylist, and support clicking appointments to view/edit details.

## Technology Choice
- **FullCalendar** (`@fullcalendar/react` with plugins): Industry-standard React calendar library with excellent documentation, drag-and-drop support, and multiple view options (day, week, month).

## Files to Create

### 1. `/frontend/app/dashboard/schedule/page.tsx`
- New calendar page with FullCalendar integration
- Filter controls for stylist selection
- Integration with existing `useAppointments` hook
- Modal for viewing/editing appointment details on click

### 2. `/frontend/components/appointments/appointment-calendar.tsx`
- Reusable FullCalendar wrapper component
- Handles appointment data transformation to FullCalendar event format
- Configures calendar views (month, week, day)
- Applies color-coding based on appointment status

### 3. `/frontend/components/appointments/calendar-event-tooltip.tsx` (optional)
- Custom tooltip component for calendar events
- Shows client name, stylist, services, and status on hover

## Files to Modify

### 1. `/frontend/components/layout/sidebar.tsx`
- Add navigation link to the new Schedule page

### 2. `/frontend/package.json`
- Add FullCalendar dependencies:
  - `@fullcalendar/react`
  - `@fullcalendar/core`
  - `@fullcalendar/daygrid`
  - `@fullcalendar/timegrid`
  - `@fullcalendar/interaction`

### 3. `/frontend/hooks/use-appointments.ts` (if needed)
- May need to add hook for fetching appointments with date range parameters for performance

## Implementation Steps

### Step 1: Install Dependencies
```bash
cd frontend
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

### Step 2: Create Calendar Component
Create `appointment-calendar.tsx`:
- Transform appointment data to FullCalendar event format:
  ```typescript
  {
    id: appointment.id,
    title: `${client.user.firstName} ${client.user.lastName}`,
    start: appointment.scheduledStart,
    end: appointment.scheduledEnd,
    backgroundColor: getStatusColor(appointment.status),
    extendedProps: { appointment }
  }
  ```
- Configure views: dayGridMonth, timeGridWeek, timeGridDay
- Enable event clicking to trigger edit modal
- Enable event dragging for rescheduling (optional, may be future enhancement)

### Step 3: Create Schedule Page
Create `/app/dashboard/schedule/page.tsx`:
- Fetch all appointments using `useAppointments()`
- Add stylist filter dropdown (populated from existing stylists)
- Render the AppointmentCalendar component
- Handle event clicks to open AppointmentModal
- Handle date range navigation (FullCalendar handles this natively)

### Step 4: Update Sidebar Navigation
Add schedule link to sidebar.tsx:
- Calendar icon from lucide-react
- Link to `/dashboard/schedule`
- Position appropriately (probably near Appointments link)

### Step 5: Styling Integration
- FullCalendar works well with Tailwind CSS
- Use existing status color scheme from appointments page
- Ensure calendar container has proper height constraints

## Color Scheme for Appointments
Match existing status colors from `appointments/page.tsx`:
- SCHEDULED: Blue (info)
- CONFIRMED: Green (success)
- IN_PROGRESS: Yellow/Orange (warning)
- COMPLETED: Green (success)
- CANCELLED: Gray (neutral)
- NO_SHOW: Red (danger)

## Data Flow
1. Schedule page loads → `useAppointments()` fetches all appointments via React Query
2. Appointments transformed to FullCalendar event format
3. FullCalendar renders events on calendar
4. User clicks event → Opens existing `AppointmentModal` for editing
5. After update → React Query invalidates cache → Calendar refreshes

## Critical Files Reference
- `/frontend/app/dashboard/appointments/page.tsx` - Existing appointments page (reference for status colors, patterns)
- `/frontend/hooks/use-appointments.ts` - React Query hooks for appointments
- `/frontend/lib/api/appointments.ts` - API client (already supports date range queries)
- `/frontend/components/appointments/appointment-modal.tsx` - Existing modal (reusable for editing)
- `/frontend/components/layout/sidebar.tsx` - Navigation sidebar (add schedule link)
- `/frontend/types/index.ts` - TypeScript types for Appointment

## Verification Steps
1. Install dependencies and verify no build errors
2. Navigate to `/dashboard/schedule` - calendar should display with all appointments
3. Verify appointments are color-coded by status
4. Click an appointment - should open AppointmentModal with correct data
5. Edit an appointment - save and verify calendar updates
6. Test view switching (month/week/day)
7. Test stylist filter if implemented
8. Verify responsive design works on mobile

## Future Enhancements (Out of Scope)
- Drag-and-drop appointment rescheduling
- Resource view showing multiple stylists side-by-side
- Quick-create appointment by clicking empty time slots
- Export calendar to iCal format
- Recurring appointment visualization
