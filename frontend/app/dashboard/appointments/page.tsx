'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AppointmentModal } from '@/components/appointments/appointment-modal';
import { useAppointments, useCancelAppointment, useDeleteAppointment } from '@/hooks/use-appointments';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import type { Appointment, AppointmentStatus } from '@/types';
import { format } from 'date-fns';

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  SCHEDULED: 'info',
  CONFIRMED: 'success',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'neutral',
  NO_SHOW: 'danger',
};

export default function AppointmentsPage() {
  const router = useRouter();
  const { data: appointments, isLoading, error } = useAppointments();
  const cancelAppointment = useCancelAppointment();
  const deleteAppointment = useDeleteAppointment();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filteredAppointments = appointments?.filter((appointment) => {
    const matchesSearch = !searchQuery || (
      appointment.client.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.client.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.client.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.stylist.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.stylist.user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesStatus = !statusFilter || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) ?? [];

  const handleCancel = async (appointment: Appointment) => {
    const reason = prompt('Reason for cancellation (optional):');
    if (reason !== null) {
      try {
        await cancelAppointment.mutateAsync({ id: appointment.id, reason: reason || undefined });
      } catch {
        // Error is handled by the mutation hook
      }
    }
  };

  const handleDelete = async (appointment: Appointment) => {
    if (confirm(`Are you sure you want to delete this appointment?`)) {
      try {
        await deleteAppointment.mutateAsync(appointment.id);
      } catch {
        // Error is handled by the mutation hook
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage appointments and scheduling</p>
        </div>
        <Button onClick={() => { setSelectedAppointment(undefined); setShowModal(true); }} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Schedule Appointment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Appointments ({appointments?.length ?? 0})</CardTitle>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="NO_SHOW">No Show</option>
              </select>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading appointments...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">Failed to load appointments</div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">
                {searchQuery || statusFilter ? 'No appointments match your filters.' : 'No appointments yet. Schedule your first appointment to get started.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Stylist</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow
                    key={appointment.id}
                    clickable
                    onClick={() => router.push(`/dashboard/appointments/${appointment.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {format(new Date(appointment.scheduledStart), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(appointment.scheduledStart), 'h:mm a')} -{' '}
                          {format(new Date(appointment.scheduledEnd), 'h:mm a')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.client.user.firstName} {appointment.client.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{appointment.client.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {appointment.stylist.user.firstName} {appointment.stylist.user.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {appointment.services?.slice(0, 2).map((as: any) => (
                          <span key={as.service.id} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                            {as.service.name}
                          </span>
                        ))}
                        {(appointment.services?.length || 0) > 2 && (
                          <span className="text-xs text-gray-500">
                            +{(appointment.services?.length || 0) - 2} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[appointment.status] || 'neutral'}>
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedAppointment(appointment); setShowModal(true); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(appointment)}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(appointment)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedAppointment(undefined); }}
        appointment={selectedAppointment}
      />
    </DashboardLayout>
  );
}
