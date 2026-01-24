'use client';

import * as React from 'react';
import { DropDownListComponent, ChangeEventArgs } from '@syncfusion/ej2-react-dropdowns';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { View } from '@syncfusion/ej2-react-schedule';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export interface CalendarSettings {
  currentView: View;
  startHour: string;
  endHour: string;
  interval: number;
  firstDayOfWeek: number;
}

const DEFAULT_SETTINGS: CalendarSettings = {
  currentView: 'TimelineWeek',
  startHour: '09:00',
  endHour: '18:00',
  interval: 30,
  firstDayOfWeek: 1, // Monday
};

// Dropdown options
const VIEWS = [
  { Value: 'Day', Text: 'Daily' },
  { Value: 'Week', Text: 'Weekly' },
  { Value: 'Month', Text: 'Monthly' },
  { Value: 'TimelineDay', Text: 'Timeline Day' },
  { Value: 'TimelineWeek', Text: 'Timeline Week' },
  { Value: 'TimelineMonth', Text: 'Timeline Month' },
];

const START_HOURS = [
  { Value: '08:00', Text: '8:00 AM' },
  { Value: '09:00', Text: '9:00 AM' },
  { Value: '10:00', Text: '10:00 AM' },
  { Value: '11:00', Text: '11:00 AM' },
  { Value: '12:00', Text: '12:00 PM' },
];

const END_HOURS = [
  { Value: '16:00', Text: '4:00 PM' },
  { Value: '17:00', Text: '5:00 PM' },
  { Value: '18:00', Text: '6:00 PM' },
  { Value: '19:00', Text: '7:00 PM' },
  { Value: '20:00', Text: '8:00 PM' },
  { Value: '21:00', Text: '9:00 PM' },
];

const TIME_SLOTS = [
  { Value: 10, Text: '10 mins' },
  { Value: 20, Text: '20 mins' },
  { Value: 30, Text: '30 mins' },
  { Value: 60, Text: '60 mins' },
  { Value: 120, Text: '120 mins' },
];

const DAYS_OF_WEEK = [
  { Value: 0, Text: 'Sunday' },
  { Value: 1, Text: 'Monday' },
  { Value: 2, Text: 'Tuesday' },
  { Value: 3, Text: 'Wednesday' },
  { Value: 4, Text: 'Thursday' },
  { Value: 5, Text: 'Friday' },
  { Value: 6, Text: 'Saturday' },
];

const fields = { text: 'Text', value: 'Value' };

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

  const handleChange = (args: ChangeEventArgs) => {
    const id = args.element?.getAttribute('id');
    if (!id) return;

    switch (id) {
      case 'CurrentView':
        setLocalSettings({ ...localSettings, currentView: args.value as View });
        break;
      case 'CalendarStart':
        setLocalSettings({ ...localSettings, startHour: args.value as string });
        break;
      case 'CalendarEnd':
        setLocalSettings({ ...localSettings, endHour: args.value as string });
        break;
      case 'Duration':
        setLocalSettings({ ...localSettings, interval: args.value as number });
        break;
      case 'FirstDayOfWeek':
        setLocalSettings({ ...localSettings, firstDayOfWeek: args.value as number });
        break;
    }
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const dialogClose = () => {
    setLocalSettings(settings); // Reset to original
    onClose();
  };

  return (
    <DialogComponent
      width="400px"
      target="#portal-dialog"
      visible={isOpen}
      close={dialogClose}
      header="Calendar Preferences"
      showCloseIcon={true}
      cssClass="calendar-settings-dialog"
    >
      <style>{`
        .calendar-settings-dialog .e-dlg-content {
          padding: 20px;
        }
        .calendar-settings-dialog .control-container {
          padding-top: 16px;
        }
        .calendar-settings-dialog .label-text {
          margin-left: 0;
          font-weight: 600;
          font-size: 12px;
          color: #333;
          letter-spacing: 0.33px;
          padding-bottom: 7px;
          display: block;
        }
        .calendar-settings-dialog .e-dropdown {
          width: 100%;
        }
      `}</style>

      <div className="control-container">
        <label className="label-text">Default View</label>
        <DropDownListComponent
          id="CurrentView"
          dataSource={VIEWS}
          fields={fields}
          value={localSettings.currentView}
          change={handleChange}
        />
      </div>

      <div className="control-container">
        <label className="label-text">Calendar Start Time</label>
        <DropDownListComponent
          id="CalendarStart"
          dataSource={START_HOURS}
          fields={fields}
          value={localSettings.startHour}
          change={handleChange}
        />
      </div>

      <div className="control-container">
        <label className="label-text">Calendar End Time</label>
        <DropDownListComponent
          id="CalendarEnd"
          dataSource={END_HOURS}
          fields={fields}
          value={localSettings.endHour}
          change={handleChange}
        />
      </div>

      <div className="control-container">
        <label className="label-text">Slot Duration</label>
        <DropDownListComponent
          id="Duration"
          dataSource={TIME_SLOTS}
          fields={fields}
          value={localSettings.interval}
          change={handleChange}
        />
      </div>

      <div className="control-container">
        <label className="label-text">First Day of the Week</label>
        <DropDownListComponent
          id="FirstDayOfWeek"
          dataSource={DAYS_OF_WEEK}
          fields={fields}
          value={localSettings.firstDayOfWeek}
          change={handleChange}
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={dialogClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </DialogComponent>
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
        setSettings(JSON.parse(saved));
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
