import { Appointment } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, X, Calendar, Clock, User, Scissors } from 'lucide-react';
import { format } from 'date-fns';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  onClick: (appointment: Appointment) => void;
}

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  SCHEDULED: 'info',
  CONFIRMED: 'success',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'neutral',
  NO_SHOW: 'danger',
};

export function AppointmentCard({ appointment, onEdit, onCancel, onDelete, onClick }: AppointmentCardProps) {
  const clientName = `${appointment.client.user.firstName} ${appointment.client.user.lastName}`;
  const stylistName = `${appointment.stylist.user.firstName} ${appointment.stylist.user.lastName}`;
  const startDate = new Date(appointment.scheduledStart);
  const endDate = new Date(appointment.scheduledEnd);

  return (
    <div
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md"
      onClick={() => onClick(appointment)}
    >
      {/* Card Header - Status and Date */}
      <div className="relative bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
        <div className="flex items-start justify-between">
          {/* Date and Time */}
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {format(startDate, 'dd')}
                  </div>
                  <div className="text-xs font-medium text-gray-600 uppercase">
                    {format(startDate, 'MMM')}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={statusColors[appointment.status] || 'neutral'} className="text-xs">
                  {appointment.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium">
                  {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>
                  {format(startDate, 'EEEE, MMMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className="flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(appointment)}
              className="h-8 w-8 rounded-lg p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(appointment)}
                className="h-8 w-8 rounded-lg p-0 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(appointment)}
              className="h-8 w-8 rounded-lg p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Card Body - Details */}
      <div className="p-4">
        {/* Client and Stylist */}
        <div className="mb-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">{clientName}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{appointment.client.user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Scissors className="h-4 w-4 text-gray-400" />
            <span>Stylist: <span className="font-medium text-gray-900">{stylistName}</span></span>
          </div>
        </div>

        {/* Services */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {appointment.services?.slice(0, 3).map((as: any) => (
              <span key={as.service.id} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
                {as.service.name}
              </span>
            ))}
            {(appointment.services?.length || 0) > 3 && (
              <span className="text-xs text-gray-500">
                +{(appointment.services?.length || 0) - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Notes */}
        {appointment.notes && (
          <div className="rounded-lg bg-gray-50 p-2 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Notes:</span> {appointment.notes}
          </div>
        )}
      </div>
    </div>
  );
}
