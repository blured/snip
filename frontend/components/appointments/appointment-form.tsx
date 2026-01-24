import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useClients } from '@/hooks/use-clients';
import { useStylists } from '@/hooks/use-stylists';
import { useServices } from '@/hooks/use-services';
import type { Appointment } from '@/types';

interface NewAppointmentData {
  startTime: Date;
  endTime: Date;
  stylistId?: string;
}

interface AppointmentFormProps {
  appointment?: Appointment;
  newAppointmentData?: NewAppointmentData;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AppointmentForm({ appointment, newAppointmentData, onSubmit, onCancel, isLoading }: AppointmentFormProps) {
  const { data: clients } = useClients();
  const { data: stylists } = useStylists();
  const { data: services } = useServices();

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    appointment?.services?.map((as: any) => as.service.id) || []
  );

  const [formData, setFormData] = useState({
    clientId: appointment?.clientId || '',
    stylistId: appointment?.stylistId || '',
    scheduledStart: appointment?.scheduledStart
      ? new Date(appointment.scheduledStart).toISOString().slice(0, 16)
      : '',
    scheduledEnd: appointment?.scheduledEnd
      ? new Date(appointment.scheduledEnd).toISOString().slice(0, 16)
      : '',
    notes: appointment?.notes || '',
  });

  // Pre-fill form when clicking on calendar
  useEffect(() => {
    if (newAppointmentData && !appointment) {
      setFormData({
        clientId: '',
        stylistId: newAppointmentData.stylistId || '',
        scheduledStart: new Date(newAppointmentData.startTime).toISOString().slice(0, 16),
        scheduledEnd: new Date(newAppointmentData.endTime).toISOString().slice(0, 16),
        notes: '',
      });
    }
  }, [newAppointmentData, appointment]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Client is required';
    }
    if (!formData.stylistId) {
      newErrors.stylistId = 'Stylist is required';
    }
    if (!formData.scheduledStart) {
      newErrors.scheduledStart = 'Start time is required';
    }
    if (!formData.scheduledEnd) {
      newErrors.scheduledEnd = 'End time is required';
    }
    if (selectedServiceIds.length === 0) {
      newErrors.serviceIds = 'At least one service is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: any = {
      clientId: formData.clientId,
      stylistId: formData.stylistId,
      scheduledStart: new Date(formData.scheduledStart).toISOString(),
      scheduledEnd: new Date(formData.scheduledEnd).toISOString(),
      serviceIds: selectedServiceIds,
      notes: formData.notes || undefined,
    };

    onSubmit(submitData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      const newIds = prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId];

      // Clear error if services are selected
      if (newIds.length > 0 && errors.serviceIds) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.serviceIds;
          return newErrors;
        });
      }

      return newIds;
    });
  };

  // Group services by category
  const servicesByCategory = services?.reduce((acc: Record<string, typeof services>, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {}) || {};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Client *
        </label>
        <select
          value={formData.clientId}
          onChange={(e) => handleChange('clientId', e.target.value)}
          disabled={isLoading}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.clientId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a client</option>
          {clients?.map((client) => (
            <option key={client.id} value={client.id}>
              {client.user.firstName} {client.user.lastName} ({client.user.email})
            </option>
          ))}
        </select>
        {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Stylist *
        </label>
        <select
          value={formData.stylistId}
          onChange={(e) => handleChange('stylistId', e.target.value)}
          disabled={isLoading}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.stylistId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a stylist</option>
          {stylists?.filter((s) => s.active).map((stylist) => (
            <option key={stylist.id} value={stylist.id}>
              {stylist.user.firstName} {stylist.user.lastName}
            </option>
          ))}
        </select>
        {errors.stylistId && <p className="mt-1 text-sm text-red-600">{errors.stylistId}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Start Time *
          </label>
          <input
            type="datetime-local"
            value={formData.scheduledStart}
            onChange={(e) => handleChange('scheduledStart', e.target.value)}
            disabled={isLoading}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.scheduledStart ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.scheduledStart && <p className="mt-1 text-sm text-red-600">{errors.scheduledStart}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            End Time *
          </label>
          <input
            type="datetime-local"
            value={formData.scheduledEnd}
            onChange={(e) => handleChange('scheduledEnd', e.target.value)}
            disabled={isLoading}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.scheduledEnd ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.scheduledEnd && <p className="mt-1 text-sm text-red-600">{errors.scheduledEnd}</p>}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Services *
        </label>
        <div className="max-h-60 space-y-3 overflow-y-auto rounded-lg border border-gray-300 p-3">
          {Object.keys(servicesByCategory).length === 0 ? (
            <p className="text-sm text-gray-500">No services available</p>
          ) : (
            Object.entries(servicesByCategory).map(([category, categoryServices]) => (
              <div key={category}>
                <h4 className="mb-2 text-sm font-semibold text-gray-700 capitalize">{category}</h4>
                <div className="space-y-2">
                  {categoryServices.map((service) => {
                    const isSelected = selectedServiceIds.includes(service.id);
                    return (
                      <label
                        key={service.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleService(service.id)}
                          disabled={isLoading}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{service.name}</p>
                          {service.description && (
                            <p className="text-xs text-gray-500">{service.description}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-600">
                            {service.durationMinutes} min • €{service.basePrice.toFixed(2)}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
        {errors.serviceIds && <p className="mt-1 text-sm text-red-600">{errors.serviceIds}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          disabled={isLoading}
          rows={3}
          placeholder="Any additional notes..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : appointment ? 'Update Appointment' : 'Create Appointment'}
        </Button>
      </div>
    </form>
  );
}
