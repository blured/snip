'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StylistModal } from '@/components/stylists/stylist-modal';
import { useStylistDetail, useDeleteStylist } from '@/hooks/use-stylists';
import { ArrowLeft, Pencil, Trash2, Mail, Phone, Calendar, Scissors, DollarSign, User } from 'lucide-react';
import { format } from 'date-fns';

export default function StylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: stylist, isLoading, error } = useStylistDetail(id);
  const deleteStylist = useDeleteStylist();

  const handleDelete = async () => {
    if (!stylist) return;
    const stylistName = `${stylist.user.firstName} ${stylist.user.lastName}`;
    if (confirm(`Are you sure you want to delete ${stylistName}? This action cannot be undone.`)) {
      try {
        await deleteStylist.mutateAsync(id);
        router.push('/dashboard/stylists');
      } catch {
        // Error handled by mutation hook
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading stylist...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stylist) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-red-500">Failed to load stylist</div>
        </div>
      </DashboardLayout>
    );
  }

  const stylistName = `${stylist.user.firstName} ${stylist.user.lastName}`;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/stylists')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stylists
        </Button>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Photo */}
              <div className="flex-shrink-0">
                {stylist.photo ? (
                  <img
                    src={stylist.photo}
                    alt={stylistName}
                    className="h-32 w-32 rounded-full object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-4xl font-bold text-white shadow-lg">
                    {stylist.user.firstName[0]}{stylist.user.lastName[0]}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{stylistName}</h1>
                    <p className="text-gray-600">
                      {stylist.specialties || 'Professional Stylist'}
                    </p>
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

                {/* Contact Info */}
                <div className="mb-4 flex flex-col gap-2 text-sm text-gray-600 md:flex-row md:gap-6">
                  {stylist.user.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{stylist.user.email}</span>
                    </div>
                  )}
                  {stylist.user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{stylist.user.phone}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {stylist.bio && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 font-semibold text-gray-900">About</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{stylist.bio}</p>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-col gap-4 md:w-48">
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {stylist.appointments?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Appointments</div>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {stylist.appointments?.filter(a => a.status === 'COMPLETED').length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="rounded-lg bg-purple-50 p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {stylist.appointments?.filter(a =>
                      a.status === 'SCHEDULED' || a.status === 'CONFIRMED'
                    ).length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Upcoming</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Appointments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointments ({stylist.appointments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!stylist.appointments || stylist.appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Calendar className="mb-4 h-12 w-12 text-gray-300" />
                  <p className="text-gray-500">No appointments yet</p>
                </div>
              ) : (
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
                    {stylist.appointments
                      .sort((a, b) => new Date(b.scheduledStart).getTime() - new Date(a.scheduledStart).getTime())
                      .map((appointment) => (
                        <TableRow
                          key={appointment.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => router.push(`/dashboard/appointments/${appointment.id}`)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {format(new Date(appointment.scheduledStart), 'MMM d, yyyy')}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(new Date(appointment.scheduledStart), 'h:mm a')} - {format(new Date(appointment.scheduledEnd), 'h:mm a')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {appointment.client.user.firstName} {appointment.client.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{appointment.client.user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {appointment.services && appointment.services.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {appointment.services.map((as) => (
                                  <span
                                    key={as.id}
                                    className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                                  >
                                    {as.service.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={{
                              SCHEDULED: 'neutral',
                              CONFIRMED: 'info',
                              IN_PROGRESS: 'warning',
                              COMPLETED: 'success',
                              CANCELLED: 'danger',
                              NO_SHOW: 'danger',
                            }[appointment.status] || 'neutral'}>
                              {appointment.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Hourly Rate</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stylist.hourlyRate ? `$${stylist.hourlyRate.toFixed(2)}/hr` : 'Not set'}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Commission Rate</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stylist.commissionRate ? `${stylist.commissionRate}%` : 'Not set'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Account Status</dt>
                  <dd>
                    <Badge variant={stylist.active ? 'success' : 'neutral'}>
                      {stylist.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Member Since</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {format(new Date(stylist.createdAt), 'MMM yyyy')}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Stylist Modal */}
      <StylistModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        stylist={stylist}
      />
    </DashboardLayout>
  );
}
