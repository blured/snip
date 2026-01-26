'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

// Generate consistent color for stylist based on their ID
function getStylistColor(stylistId: string, index: number): string {
  const colors = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#f97316', // orange
    '#6366f1', // indigo
    '#84cc16', // lime
    '#14b8a6', // teal
  ];
  // Use stylist ID to pick a consistent color
  const hash = stylistId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

type ViewType = 'day' | 'week' | 'workWeek' | 'month';

interface MiniCalendarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

function MiniCalendar({ currentDate, onDateSelect, selectedDate }: MiniCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date(currentDate));

  const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const monthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const days: Date[] = [];
  const current = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();
  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const isCurrentMonth = (date: Date) => date.getMonth() === viewDate.getMonth();

  const prevMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setViewDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setViewDate(newDate);
  };

  return (
    <div className="bg-white border border-gray-400 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-gray-100 rounded text-gray-900"
          title="Previous month"
        >
          ‹
        </button>
        <span className="font-semibold text-gray-900">
          {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded text-gray-900"
          title="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="font-medium text-gray-600">
            {day.charAt(0)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date) => (
          <button
            key={date.toISOString()}
            onClick={() => onDateSelect(date)}
            className={`h-7 text-xs rounded hover:bg-gray-100 transition-colors ${
              isSelected(date) ? 'bg-blue-500 text-white font-semibold' : ''
            } ${isToday(date) && !isSelected(date) ? 'border border-blue-500 font-semibold' : ''}
            ${!isCurrentMonth(date) ? 'text-gray-400' : 'text-gray-900'}`}
          >
            {date.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
}

interface AppointmentCardProps {
  appointment: Appointment;
  onClose: () => void;
  stylists?: Array<{ id: string; user: { firstName: string; lastName: string }; photo?: string }>;
  onEventClick?: (appointment: Appointment) => void;
}

function AppointmentCard({ appointment, onClose, stylists, onEventClick }: AppointmentCardProps) {
  const startDate = new Date(appointment.scheduledStart);
  const endDate = new Date(appointment.scheduledEnd);

  const getStylistName = (stylistId: string) => {
    const stylist = stylists?.find((s) => s.id === stylistId);
    return stylist ? `${stylist.user.firstName} ${stylist.user.lastName}` : 'Unknown';
  };

  const getStylistPhoto = (stylistId: string) => {
    const stylist = stylists?.find((s) => s.id === stylistId);
    return stylist?.photo;
  };

  const statusColors: Record<AppointmentStatus, { bg: string; text: string }> = {
    SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-800' },
    CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800' },
    IN_PROGRESS: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    COMPLETED: { bg: 'bg-green-100', text: 'text-green-800' },
    CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800' },
    NO_SHOW: { bg: 'bg-red-100', text: 'text-red-800' },
  };

  const statusStyle = statusColors[appointment.status];

  const stylistPhoto = getStylistPhoto(appointment.stylistId);

  return (
    <div className="fixed inset-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 p-0 sm:p-4 bg-white sm:bg-transparent">
      <div className="bg-white sm:rounded-lg shadow-2xl w-full h-full sm:max-w-md sm:max-h-[85vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-400 bg-gray-50 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {appointment.client.user.firstName} {appointment.client.user.lastName}
              </h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                {appointment.status.replace('_', ' ')}
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                onEventClick?.(appointment);
              }}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              title="Edit appointment"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732a2.5 2.5 0 013.536 3.536z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Time */}
          <div className="flex items-start gap-3">
            <div className="text-blue-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">When</p>
              <p className="font-semibold text-gray-900">
                {startDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-gray-700">
                {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} -{' '}
                {endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Stylist with Photo */}
          <div className="flex items-start gap-3">
            <div className="text-purple-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex items-center gap-3 flex-1">
              {stylistPhoto ? (
                <img
                  src={stylistPhoto}
                  alt={getStylistName(appointment.stylistId)}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-lg font-semibold text-purple-600">
                    {getStylistName(appointment.stylistId).charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Stylist</p>
                <p className="font-semibold text-gray-900">{getStylistName(appointment.stylistId)}</p>
              </div>
            </div>
          </div>

          {/* Services */}
          {appointment.services && appointment.services.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="text-green-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Services</p>
                <ul className="mt-1 space-y-1">
                  {appointment.services.map((as: any) => (
                    <li key={as.service.id} className="text-gray-900">
                      <span className="font-medium">{as.service.name}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({as.service.durationMinutes} min • €{as.service.basePrice.toFixed(2)})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="flex items-start gap-3">
              <div className="text-yellow-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-gray-900">{appointment.notes}</p>
              </div>
            </div>
          )}

          {/* Client Contact */}
          <div className="flex items-start gap-3">
            <div className="text-red-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact</p>
              <p className="text-gray-900">{appointment.client.user.email}</p>
              {appointment.client.user.phone && (
                <p className="text-gray-900">{appointment.client.user.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-400 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-stretch sm:justify-between flex-shrink-0">
          <button
            onClick={() => {
              onClose();
              onEventClick?.(appointment);
            }}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2 min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Appointment
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 border border-gray-400 rounded-lg hover:bg-gray-100 transition-colors text-gray-900 font-medium min-h-[44px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface NavigationButtonsProps {
  currentView: ViewType;
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onViewChange: (view: ViewType) => void;
  stylistFilter?: string;
  stylists?: Array<{ id: string; user: { firstName: string; lastName: string } }>;
  onStylistFilterChange?: (stylistId: string) => void;
  onDateSelect?: (date: Date) => void;
  appointments?: Appointment[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

function NavigationButtons({
  currentView,
  currentDate,
  onNavigate,
  onViewChange,
  stylistFilter,
  stylists,
  onStylistFilterChange,
  onDateSelect,
  onSettingsClick,
  searchQuery = '',
  onSearchChange,
}: NavigationButtonsProps & { onSettingsClick?: () => void }) {

  const formatDateRange = () => {
    switch (currentView) {
      case 'day':
        return currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

      case 'week': {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startOfWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
        }
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'short' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
      }

      case 'workWeek': {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        startOfWeek.setDate(startOfWeek.getDate() + diff);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 4);

        return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }

      case 'month':
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4">
      {/* Top row on mobile: Today + Navigation + Date */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('today')}
            className="px-3 py-2 text-sm border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors text-gray-900 font-medium min-h-[40px]"
            title="Go to today"
          >
            Today
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onNavigate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-900 min-h-[40px] min-w-[40px]"
              title="Previous"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => onNavigate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-900 min-h-[40px] min-w-[40px]"
              title="Next"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <h2 className="text-base sm:text-xl font-semibold text-gray-900 truncate px-2">{formatDateRange()}</h2>
      </div>

      {/* Bottom row: View Switcher + Filters + Settings */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* View Switcher - scrollable on mobile */}
        <div className="flex border border-gray-400 rounded-lg overflow-hidden flex-1 sm:flex-none overflow-x-auto">
          <button
            onClick={() => onViewChange('day')}
            className={`px-3 py-2 transition-colors border-r border-gray-400 font-medium text-sm whitespace-nowrap min-h-[40px] ${
              currentView === 'day' ? 'bg-blue-500 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => onViewChange('week')}
            className={`px-3 py-2 transition-colors border-r border-gray-400 font-medium text-sm whitespace-nowrap min-h-[40px] ${
              currentView === 'week' ? 'bg-blue-500 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => onViewChange('workWeek')}
            className={`px-3 py-2 transition-colors border-r border-gray-400 font-medium text-sm whitespace-nowrap min-h-[40px] ${
              currentView === 'workWeek' ? 'bg-blue-500 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'
            }`}
          >
            Work Week
          </button>
          <button
            onClick={() => onViewChange('month')}
            className={`px-3 py-2 transition-colors font-medium text-sm whitespace-nowrap min-h-[40px] ${
              currentView === 'month' ? 'bg-blue-500 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'
            }`}
          >
            Month
          </button>
        </div>

        {/* Search - full width on mobile */}
        <div className="relative w-full sm:w-auto order-first sm:order-none">
          <svg
            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors text-gray-900 w-full sm:w-40 min-h-[40px]"
          />
        </div>

        {/* Stylist Filter */}
        {onStylistFilterChange && stylists && (
          <select
            id="stylist-filter"
            className="px-3 py-2 border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors text-gray-900 min-h-[40px] text-sm"
            value={stylistFilter || ''}
            onChange={(e) => onStylistFilterChange(e.target.value)}
          >
            <option value="">All Stylists</option>
            {stylists.map((s) => (
              <option key={s.id} value={s.id}>
                {s.user.firstName} {s.user.lastName}
              </option>
            ))}
          </select>
        )}

        {/* Settings Button */}
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="p-2 border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors text-gray-900 flex items-center justify-center min-h-[40px] min-w-[40px]"
            title="Calendar settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function AppointmentCalendarCustom({
  appointments,
  stylists = [],
  stylistFilter,
  calendarSettings,
  onEventClick,
  onEventDrop,
  onStylistFilterChange,
  onAppointmentCreate,
  onSettingsClick,
}: AppointmentCalendarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStylist, setSelectedStylist] = useState<string | undefined>(stylistFilter);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize view and date from settings
  useEffect(() => {
    if (calendarSettings?.currentView) {
      const viewMap: Record<string, ViewType> = {
        'day': 'day',
        'week': 'week',
        'month': 'month',
      };
      setCurrentView(viewMap[calendarSettings.currentView] || 'week');
    }
  }, [calendarSettings?.currentView]);

  useEffect(() => {
    setIsMounted(true);
    // Listen for date change events from date picker
    const handleDateChange = ((e: CustomEvent<Date>) => {
      setCurrentDate(e.detail);
    }) as EventListener;

    window.addEventListener('dateChange', handleDateChange);
    return () => window.removeEventListener('dateChange', handleDateChange);
  }, []);

  // Get time settings from calendarSettings
  const startHour = parseInt(calendarSettings?.startHour?.split(':')[0] || '9');
  const endHour = parseInt(calendarSettings?.endHour?.split(':')[0] || '18');
  const firstDayOfWeek = calendarSettings?.firstDayOfWeek || 1; // 1 = Monday

  // Filter appointments
  const filteredAppointments = React.useMemo(() => {
    let filtered = appointments;
    if (selectedStylist) {
      filtered = filtered.filter((a) => a.stylistId === selectedStylist);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((apt) => {
        const clientName = `${apt.client.user.firstName} ${apt.client.user.lastName}`.toLowerCase();
        const stylist = stylists.find((s) => s.id === apt.stylistId);
        const stylistName = stylist ? `${stylist.user.firstName} ${stylist.user.lastName}`.toLowerCase() : '';
        const services = apt.services?.map((as: any) => as.service.name.toLowerCase()).join(' ') || '';
        const notes = apt.notes?.toLowerCase() || '';

        return (
          clientName.includes(query) ||
          stylistName.includes(query) ||
          services.includes(query) ||
          notes.includes(query)
        );
      });
    }
    return filtered;
  }, [appointments, selectedStylist, searchQuery, stylists]);

  // Get week dates (respecting firstDayOfWeek setting)
  const getWeekDates = useCallback((date: Date) => {
    const start = new Date(date);
    const day = start.getDay();

    // Calculate days to subtract to get to first day of week
    // If firstDayOfWeek is 1 (Monday), and today is Sunday (0), we need to go back 6 days
    const daysToSubtract = (day - firstDayOfWeek + 7) % 7;
    start.setDate(start.getDate() - daysToSubtract);

    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [firstDayOfWeek]);

  // Get work week dates (Monday-Friday or Monday-Saturday based on settings)
  const getWorkWeekDates = useCallback((date: Date) => {
    const start = new Date(date);
    const day = start.getDay();

    // Find previous Monday
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);

    const dates: Date[] = [];
    // Use 5 or 6 days based on includeSaturday setting
    const daysCount = calendarSettings?.includeSaturday ? 6 : 5;
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [calendarSettings?.includeSaturday]);

  // Navigate dates
  const navigateDate = useCallback((direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate);

    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }

    const daysToAdd = currentView === 'month'
      ? (direction === 'next' ? 30 : -30)
      : currentView === 'week'
      ? 7
      : currentView === 'workWeek'
      ? 7
      : 1;

    newDate.setDate(newDate.getDate() + (direction === 'next' ? daysToAdd : -daysToAdd));
    setCurrentDate(newDate);
  }, [currentDate, currentView]);

  // Filter appointments for current view
  const getAppointmentsForDate = useCallback((date: Date) => {
    return filteredAppointments.filter((apt) => {
      const aptDate = new Date(apt.scheduledStart);
      return aptDate.toDateString() === date.toDateString();
    });
  }, [filteredAppointments]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, appointment: Appointment) => {
    setDraggedAppointment(appointment);
  }, []);

  // Handle drop
  const handleDrop = useCallback(async (e: React.DragEvent, targetDate: Date, targetHour?: number) => {
    e.preventDefault();
    if (!draggedAppointment || !onEventDrop) return;

    const aptStart = new Date(draggedAppointment.scheduledStart);
    const aptEnd = new Date(draggedAppointment.scheduledEnd);
    const duration = aptEnd.getTime() - aptStart.getTime();

    const newStart = new Date(targetDate);
    if (targetHour !== undefined) {
      newStart.setHours(targetHour, aptStart.getMinutes(), 0, 0);
    }

    const newEnd = new Date(newStart.getTime() + duration);

    try {
      await onEventDrop(draggedAppointment.id, newStart, newEnd, selectedStylist);
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }

    setDraggedAppointment(null);
  }, [draggedAppointment, onEventDrop, selectedStylist]);

  // Handle time slot click for creating appointments
  const handleTimeSlotClick = useCallback((date: Date, hour: number) => {
    if (!onAppointmentCreate) return;

    const startTime = new Date(date);
    startTime.setHours(hour, 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(hour + 1, 0, 0, 0);

    onAppointmentCreate({
      startTime,
      endTime,
      stylistId: selectedStylist,
    });
  }, [onAppointmentCreate, selectedStylist]);

  // Handle stylist filter change
  const handleStylistChange = useCallback((stylistId: string) => {
    setSelectedStylist(stylistId || undefined);
    onStylistFilterChange?.(stylistId);
  }, [onStylistFilterChange]);

  // Get stylist name
  const getStylistName = (stylistId: string) => {
    const stylist = stylists.find((s) => s.id === stylistId);
    return stylist ? `${stylist.user.firstName} ${stylist.user.lastName}` : 'Unknown';
  };

  if (!isMounted) {
    return <div className="p-8 text-center text-gray-600">Loading calendar...</div>;
  }

  // Render the calendar content
  const renderCalendar = () => {
    // Work Week View
    if (currentView === 'workWeek') {
      const workWeekDates = getWorkWeekDates(currentDate);
      const workWeekDays = calendarSettings?.includeSaturday
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

      // Use fixed grid classes based on includeSaturday setting
      const gridClass = calendarSettings?.includeSaturday ? 'grid-cols-7' : 'grid-cols-6';

      return (
        <div className="flex-1 overflow-x-auto">
          <div className={`grid gap-0 border border-gray-800 min-w-[600px] sm:min-w-[1000px] ${gridClass}`}>
            {/* Header row */}
            <div className="border-r border-gray-800 p-1 sm:p-2 bg-gray-50"></div>
            {workWeekDays.map((day, i) => (
              <div key={day} className="p-1 sm:p-2 bg-gray-50 border-r border-gray-800 text-center">
                <div className="font-semibold text-xs sm:text-sm text-gray-900">{day}</div>
                <div className="text-lg sm:text-2xl font-bold text-gray-900">{workWeekDates[i].getDate()}</div>
              </div>
            ))}

            {/* Time slots */}
            {Array.from({ length: endHour - startHour }, (_, i) => {
              const hour = startHour + i;
              return (
                <React.Fragment key={hour}>
                  <div className="border-r border-b border-gray-800 p-0.5 sm:p-2 text-xs sm:text-sm text-gray-900 h-10 sm:h-16 flex items-center justify-center sm:justify-start w-8 sm:w-12 flex-shrink-0">
                    <span className="hidden sm:inline">{hour}:00</span>
                    <span className="sm:hidden text-[10px]">{hour}</span>
                  </div>
                  {workWeekDates.map((date) => {
                    const dayAppointments = getAppointmentsForDate(date).filter((apt) => {
                      const aptHour = new Date(apt.scheduledStart).getHours();
                      return aptHour === hour;
                    });

                    return (
                      <div
                        key={`${date.toISOString()}-${hour}`}
                        className="border-r border-b border-gray-800 h-10 sm:h-16 relative hover:bg-blue-50 cursor-pointer"
                        onClick={() => handleTimeSlotClick(date, hour)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, date, hour)}
                      >
                        {dayAppointments.map((apt) => {
                          const startDate = new Date(apt.scheduledStart);
                          const endDate = new Date(apt.scheduledEnd);
                          const duration = (endDate.getTime() - startDate.getTime()) / 60000;
                          const height = Math.max(duration * 0.6, 20);
                          const stylistIndex = stylists.findIndex((s) => s.id === apt.stylistId);

                          return (
                            <div
                              key={apt.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, apt)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAppointment(apt);
                              }}
                              className="absolute left-0.5 right-0.5 sm:left-1 sm:right-1 rounded p-0.5 sm:p-1 text-[10px] sm:text-xs text-white overflow-hidden cursor-pointer hover:opacity-90"
                              style={{
                                backgroundColor: getStylistColor(apt.stylistId, stylistIndex),
                                top: 0,
                                height: `${height}px`,
                              }}
                            >
                              <div className="font-semibold truncate hidden sm:block">
                                {apt.client.user.firstName} {apt.client.user.lastName}
                              </div>
                              <div className="truncate opacity-90 text-[8px] sm:text-xs">
                                {apt.client.user.firstName.split(' ')[0]}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      );
    }

    // Week View
    if (currentView === 'week') {
      const weekDates = getWeekDates(currentDate);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      return (
        <div className="flex-1 overflow-x-auto">
          <div className="grid grid-cols-8 gap-0 border border-gray-800 min-w-[600px] sm:min-w-[1000px]">
            {/* Header row */}
            <div className="border-r border-gray-800 p-1 sm:p-2 bg-gray-50"></div>
            {weekDates.map((date, i) => (
              <div key={date.toISOString()} className="p-1 sm:p-2 bg-gray-50 border-r border-gray-800 text-center">
                <div className="font-semibold text-xs sm:text-sm text-gray-900">{dayNames[i]}</div>
                <div className="text-lg sm:text-2xl font-bold text-gray-900">{date.getDate()}</div>
              </div>
            ))}

            {/* Time slots */}
            {Array.from({ length: endHour - startHour }, (_, i) => {
              const hour = startHour + i;
              return (
                <React.Fragment key={hour}>
                  <div className="border-r border-b border-gray-800 p-0.5 sm:p-2 text-xs sm:text-sm text-gray-900 h-10 sm:h-16 flex items-center justify-center sm:justify-start w-8 sm:w-12 flex-shrink-0">
                    <span className="hidden sm:inline">{hour}:00</span>
                    <span className="sm:hidden text-[10px]">{hour}</span>
                  </div>
                  {weekDates.map((date) => {
                    const dayAppointments = getAppointmentsForDate(date).filter((apt) => {
                      const aptHour = new Date(apt.scheduledStart).getHours();
                      return aptHour === hour;
                    });

                    return (
                      <div
                        key={`${date.toISOString()}-${hour}`}
                        className="border-r border-b border-gray-800 h-10 sm:h-16 relative hover:bg-blue-50 cursor-pointer"
                        onClick={() => handleTimeSlotClick(date, hour)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, date, hour)}
                      >
                        {dayAppointments.map((apt) => {
                          const startDate = new Date(apt.scheduledStart);
                          const endDate = new Date(apt.scheduledEnd);
                          const duration = (endDate.getTime() - startDate.getTime()) / 60000;
                          const height = Math.max(duration * 0.6, 20);
                          const stylistIndex = stylists.findIndex((s) => s.id === apt.stylistId);

                          return (
                            <div
                              key={apt.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, apt)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAppointment(apt);
                              }}
                              className="absolute left-0.5 right-0.5 sm:left-1 sm:right-1 rounded p-0.5 sm:p-1 text-[10px] sm:text-xs text-white overflow-hidden cursor-pointer hover:opacity-90"
                              style={{
                                backgroundColor: getStylistColor(apt.stylistId, stylistIndex),
                                top: 0,
                                height: `${height}px`,
                              }}
                            >
                              <div className="font-semibold truncate hidden sm:block">
                                {apt.client.user.firstName} {apt.client.user.lastName}
                              </div>
                              <div className="truncate opacity-90 text-[8px] sm:text-xs">
                                {apt.client.user.firstName.split(' ')[0]}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      );
    }

    // Day View
    if (currentView === 'day') {
      const dayAppointments = getAppointmentsForDate(currentDate);

      return (
        <div className="flex-1 max-w-full sm:max-w-2xl mx-auto">
          {Array.from({ length: endHour - startHour }, (_, i) => {
            const hour = startHour + i;
            const hourAppointments = dayAppointments.filter((apt) => {
              return new Date(apt.scheduledStart).getHours() === hour;
            });

            return (
              <div
                key={hour}
                className="flex border-b border-gray-800 hover:bg-blue-50 cursor-pointer"
                onClick={() => handleTimeSlotClick(currentDate, hour)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, currentDate, hour)}
              >
                <div className="w-8 sm:w-12 p-1 sm:p-2 text-xs sm:text-sm text-gray-900 border-r border-gray-800 flex items-center justify-center flex-shrink-0">
                  <span className="hidden sm:inline">{hour}:00</span>
                  <span className="sm:hidden text-[10px]">{hour}</span>
                </div>
                <div className="flex-1 p-1 sm:p-2 min-h-[40px] sm:min-h-[60px] relative">
                  {hourAppointments.map((apt) => {
                    const startDate = new Date(apt.scheduledStart);
                    const endDate = new Date(apt.scheduledEnd);
                    const duration = (endDate.getTime() - startDate.getTime()) / 60000;
                    const height = Math.max(duration * 0.7, 30);
                    const stylistIndex = stylists.findIndex((s) => s.id === apt.stylistId);

                    return (
                      <div
                        key={apt.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, apt)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointment(apt);
                        }}
                        className="absolute left-1 sm:left-2 right-1 sm:right-2 rounded p-1 sm:p-2 text-white cursor-pointer hover:opacity-90"
                        style={{
                          backgroundColor: getStylistColor(apt.stylistId, stylistIndex),
                          height: `${height}px`,
                        }}
                      >
                        <div className="font-semibold text-xs sm:text-sm">
                          {apt.client.user.firstName} {apt.client.user.lastName}
                        </div>
                        <div className="text-[10px] sm:text-sm opacity-90 hidden sm:block">
                          {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] sm:text-sm opacity-90">
                          {getStylistName(apt.stylistId)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Month View
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const monthDays: Date[] = [];
    const current = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      monthDays.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className="flex-1">
        <div className="grid grid-cols-7 gap-0 border border-gray-800">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-1 sm:p-2 bg-gray-50 border-r border-gray-800 text-center font-semibold text-gray-900 text-xs">
              {day}
            </div>
          ))}

          {/* Days */}
          {monthDays.map((date) => {
            const dayAppointments = getAppointmentsForDate(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === today.toDateString();

            return (
              <div
                key={date.toISOString()}
                className={`border-r border-b border-gray-800 p-1 sm:p-2 min-h-[60px] sm:min-h-[100px] ${
                  !isCurrentMonth ? 'bg-gray-50' : ''
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}`}>
                  {date.getDate()}
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  {dayAppointments.slice(0, 3).map((apt) => {
                    const stylistIndex = stylists.findIndex((s) => s.id === apt.stylistId);
                    return (
                      <div
                        key={apt.id}
                        onClick={() => setSelectedAppointment(apt)}
                        className="text-[8px] sm:text-xs p-0.5 sm:p-1 rounded text-white truncate cursor-pointer hover:opacity-90"
                        style={{ backgroundColor: getStylistColor(apt.stylistId, stylistIndex) }}
                      >
                        <span className="hidden sm:inline">
                          {new Date(apt.scheduledStart).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                        </span>
                        {apt.client.user.firstName}
                      </div>
                    );
                  })}
                  {dayAppointments.length > 3 && (
                    <div className="text-[8px] sm:text-xs text-gray-900">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Main Google Calendar-style layout
  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Sidebar with Mini Calendar - hidden on mobile */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <MiniCalendar
          currentDate={currentDate}
          selectedDate={currentDate}
          onDateSelect={(date) => setCurrentDate(date)}
        />

        {/* Create Appointment Button */}
        <button
          onClick={() => {
            const now = new Date();
            handleTimeSlotClick(now, now.getHours());
          }}
          className="w-full mt-4 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm min-h-[44px]"
        >
          + Create Appointment
        </button>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 bg-white rounded-lg shadow min-w-0">
        {/* Mobile Create Button */}
        <div className="lg:hidden p-4 border-b border-gray-200">
          <button
            onClick={() => {
              const now = new Date();
              handleTimeSlotClick(now, now.getHours());
            }}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm min-h-[44px]"
          >
            + Create Appointment
          </button>
        </div>

        <div className="p-2 sm:p-4">
          <NavigationButtons
            currentView={currentView}
            currentDate={currentDate}
            onNavigate={navigateDate}
            onViewChange={setCurrentView}
            stylistFilter={selectedStylist}
            stylists={stylists}
            onStylistFilterChange={handleStylistChange}
            onDateSelect={(date) => setCurrentDate(date)}
            onSettingsClick={onSettingsClick}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Calendar Content */}
        <div className="px-2 sm:px-4 pb-4 overflow-x-auto">
          {renderCalendar()}
        </div>
      </div>

      {/* Appointment Detail Card */}
      {selectedAppointment && (
        <AppointmentCard
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          stylists={stylists}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
}
