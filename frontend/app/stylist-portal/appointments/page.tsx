'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAppointments } from '@/hooks/use-appointments';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function StylistAppointmentsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { data: appointments, isLoading, error } = useAppointments();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'STYLIST') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Filter to show only this stylist's appointments
  const stylistAppointments = appointments?.filter(
    (apt) => apt.stylistId === user.stylistId
  );

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600">View your upcoming appointments</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading appointments...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-red-500">Failed to load appointments</div>
        </div>
      ) : stylistAppointments && stylistAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500">No upcoming appointments</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stylistAppointments.map((apt: any) => (
                <TableRow key={apt.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {format(new Date(apt.scheduledStart), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(apt.scheduledStart), 'h:mm a')} - {format(new Date(apt.scheduledEnd), 'h:mm a')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {apt.client.user.firstName} {apt.client.user.lastName}
                  </TableCell>
                  <TableCell>
                    {apt.services?.map((as: any) => (
                      <span
                        key={as.id}
                        className="mr-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                      >
                        {as.service.name}
                      </span>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={apt.status === 'COMPLETED' ? 'success' : 'neutral'}>
                      {apt.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardLayout>
  );
}
