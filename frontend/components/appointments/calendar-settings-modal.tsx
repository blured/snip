'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, X } from 'lucide-react';

export interface CalendarSettings {
  currentView: 'day' | 'week' | 'month';
  startHour: string;
  endHour: string;
  interval: number;
  firstDayOfWeek: number;
}

const DEFAULT_SETTINGS: CalendarSettings = {
  currentView: 'week',
  startHour: '09:00',
  endHour: '18:00',
  interval: 30,
  firstDayOfWeek: 1, // Monday
};

// Dropdown options
const VIEWS = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
];

const START_HOURS = [
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
];

const END_HOURS = [
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '21:00', label: '9:00 PM' },
];

const TIME_SLOTS = [
  { value: 10, label: '10 mins' },
  { value: 20, label: '20 mins' },
  { value: 30, label: '30 mins' },
  { value: 60, label: '60 mins' },
  { value: 120, label: '120 mins' },
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

interface CalendarSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CalendarSettings;
  onSave: (settings: CalendarSettings) => void;
}

export function CalendarSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: CalendarSettingsModalProps) {
  const [localSettings, setLocalSettings] = React.useState<CalendarSettings>(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings); // Reset to original
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Calendar Preferences</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-5">
            {/* Default View */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Default View
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={localSettings.currentView}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    currentView: e.target.value as CalendarSettings['currentView'],
                  })
                }
              >
                {VIEWS.map((view) => (
                  <option key={view.value} value={view.value}>
                    {view.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Calendar Start Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Calendar Start Time
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={localSettings.startHour}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, startHour: e.target.value })
                }
              >
                {START_HOURS.map((hour) => (
                  <option key={hour.value} value={hour.value}>
                    {hour.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Calendar End Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Calendar End Time
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={localSettings.endHour}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, endHour: e.target.value })
                }
              >
                {END_HOURS.map((hour) => (
                  <option key={hour.value} value={hour.value}>
                    {hour.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Slot Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Slot Duration
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={localSettings.interval}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, interval: Number(e.target.value) })
                }
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>

            {/* First Day of the Week */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Day of the Week
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={localSettings.firstDayOfWeek}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, firstDayOfWeek: Number(e.target.value) })
                }
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook to manage calendar settings
export function useCalendarSettings() {
  const [settings, setSettings] = React.useState<CalendarSettings>(DEFAULT_SETTINGS);

  React.useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('calendarSettings');
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        // Ensure currentView is valid for TUI Calendar
        if (['day', 'week', 'month'].includes(parsedSettings.currentView)) {
          setSettings(parsedSettings);
        } else {
          // Migrate old timeline views to standard views
          const migratedSettings = {
            ...parsedSettings,
            currentView: 'week' as const,
          };
          setSettings(migratedSettings);
          localStorage.setItem('calendarSettings', JSON.stringify(migratedSettings));
        }
      } catch (e) {
        console.error('Failed to parse calendar settings:', e);
      }
    }
  }, []);

  const saveSettings = (newSettings: CalendarSettings) => {
    setSettings(newSettings);
    localStorage.setItem('calendarSettings', JSON.stringify(newSettings));
  };

  return { settings, saveSettings };
}

// Settings button component
export function CalendarSettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      title="Calendar Settings"
    >
      <Settings className="h-4 w-4" />
      Settings
    </button>
  );
}
