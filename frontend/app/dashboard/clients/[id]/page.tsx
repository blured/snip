'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientModal } from '@/components/clients/client-modal';
import { useClient, useClientAppointments, useClientInvoices, useDeleteClient } from '@/hooks/use-clients';
import { ArrowLeft, Pencil, Trash2, Mail, Phone, Calendar, FileText, User } from 'lucide-react';
import { format } from 'date-fns';
import type { AppointmentStatus, InvoiceStatus } from '@/types';

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  SCHEDULED: 'info',
  CONFIRMED: 'success',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'neutral',
  NO_SHOW: 'danger',
  DRAFT: 'neutral',
  PENDING: 'warning',
  PAID: 'success',
  OVERDUE: 'danger',
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: client, isLoading, error } = useClient(id);
  const { data: appointments } = useClientAppointments(id);
  const { data: invoices } = useClientInvoices(id);
  const deleteClient = useDeleteClient();

  const handleDelete = async () => {
    if (!client) return;
    const clientName = `${client.user.firstName} ${client.user.lastName}`;
    if (confirm(`Are you sure you want to delete ${clientName}? This action cannot be undone.`)) {
      try {
        await deleteClient.mutateAsync(id);
        router.push('/dashboard/clients');
      } catch {
        // Error handled by mutation hook
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading client...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !client) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-red-500">Failed to load client</div>
        </div>
      </DashboardLayout>
    );
  }

  const clientName = `${client.user.firstName} ${client.user.lastName}`;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/clients')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{clientName}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              {client.user.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {client.user.email}
                </div>
              )}
              {client.user.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {client.user.phone}
                </div>
              )}
              <Badge variant={client.user.active ? 'success' : 'neutral'}>
                {client.user.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(true)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Client Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{client.user.email || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{client.user.phone || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {client.dateOfBirth
                      ? format(new Date(client.dateOfBirth), 'MMM dd, yyyy')
                      : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Preferred Stylist</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {client.preferredStylist
                      ? `${client.preferredStylist.user.firstName} ${client.preferredStylist.user.lastName}`
                      : '-'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Notes */}
          {(client.notes || client.allergies || client.preferredProducts) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  {client.notes && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{client.notes}</dd>
                    </div>
                  )}
                  {client.allergies && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Allergies</dt>
                      <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{client.allergies}</dd>
                    </div>
                  )}
                  {client.preferredProducts && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Preferred Products</dt>
                      <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{client.preferredProducts}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Total Appointments</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {appointments?.length ?? 0}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Total Invoices</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {invoices?.length ?? 0}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Client Since</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {format(new Date(client.createdAt), 'MMM yyyy')}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Recent Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments && appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.slice(0, 5).map((appointment: any) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(appointment.scheduledStart), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(appointment.scheduledStart), 'h:mm a')} -{' '}
                          {format(new Date(appointment.scheduledEnd), 'h:mm a')}
                        </p>
                      </div>
                      <Badge variant={statusColors[appointment.status] || 'neutral'}>
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No appointments yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Invoice History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoices && invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.slice(0, 5).map((invoice: any) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">€{invoice.total.toFixed(2)}</p>
                        <Badge variant={statusColors[invoice.status] || 'neutral'} className="text-xs">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No invoices yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Client Modal */}
      <ClientModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        client={client}
      />
    </DashboardLayout>
  );
}
