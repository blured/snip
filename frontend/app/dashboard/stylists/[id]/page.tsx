'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StylistModal } from '@/components/stylists/stylist-modal';
import { useStylist, useDeleteStylist } from '@/hooks/use-stylists';
import { ArrowLeft, Pencil, Trash2, Mail, Phone, Calendar, Scissors, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function StylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: stylist, isLoading, error } = useStylist(id);
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

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{stylistName}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              {stylist.user.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {stylist.user.email}
                </div>
              )}
              {stylist.user.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {stylist.user.phone}
                </div>
              )}
              <Badge variant={stylist.active ? 'success' : 'neutral'}>
                {stylist.active ? 'Active' : 'Inactive'}
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
        {/* Stylist Information */}
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
                  <dd className="mt-1 text-sm text-gray-900">{stylist.user.email || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{stylist.user.phone || '-'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                {stylist.specialties && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Specialties</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{stylist.specialties}</dd>
                  </div>
                )}
                {stylist.bio && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Bio</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{stylist.bio}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Schedule & Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule & Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Availability management coming soon.</p>
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
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Status</dt>
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
