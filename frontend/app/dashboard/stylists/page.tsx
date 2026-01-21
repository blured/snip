'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StylistModal } from '@/components/stylists/stylist-modal';
import { useStylists, useDeleteStylist } from '@/hooks/use-stylists';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import type { Stylist } from '@/types';

export default function StylistsPage() {
  const router = useRouter();
  const { data: stylists, isLoading, error } = useStylists();
  const deleteStylist = useDeleteStylist();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | undefined>();

  const filteredStylists = stylists?.filter((stylist) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${stylist.user.firstName} ${stylist.user.lastName}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      stylist.user.email.toLowerCase().includes(searchLower) ||
      (stylist.user.phone && stylist.user.phone.includes(searchQuery)) ||
      (stylist.specialties && stylist.specialties.toLowerCase().includes(searchLower))
    );
  }) ?? [];

  const handleDelete = async (stylist: Stylist) => {
    const stylistName = `${stylist.user.firstName} ${stylist.user.lastName}`;
    if (confirm(`Are you sure you want to delete ${stylistName}?`)) {
      try {
        await deleteStylist.mutateAsync(stylist.id);
      } catch {
        // Error is handled by the mutation hook
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stylists</h1>
          <p className="text-gray-600">Manage stylists and schedules</p>
        </div>
        <Button onClick={() => { setSelectedStylist(undefined); setShowModal(true); }} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Stylist
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Stylists ({stylists?.length ?? 0})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search stylists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading stylists...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">Failed to load stylists</div>
            </div>
          ) : filteredStylists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">
                {searchQuery ? 'No stylists match your search.' : 'No stylists yet. Add your first stylist to get started.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Specialties</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStylists.map((stylist) => (
                  <TableRow
                    key={stylist.id}
                    clickable
                    onClick={() => router.push(`/dashboard/stylists/${stylist.id}`)}
                  >
                    <TableCell className="font-medium">
                      {stylist.user.firstName} {stylist.user.lastName}
                    </TableCell>
                    <TableCell>{stylist.user.email}</TableCell>
                    <TableCell>{stylist.user.phone || '-'}</TableCell>
                    <TableCell>{stylist.specialties || '-'}</TableCell>
                    <TableCell>
                      {stylist.hourlyRate ? `$${stylist.hourlyRate.toFixed(2)}/hr` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={stylist.active ? 'success' : 'neutral'}>
                        {stylist.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedStylist(stylist); setShowModal(true); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(stylist)}
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

      {/* Stylist Modal */}
      <StylistModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedStylist(undefined); }}
        stylist={selectedStylist}
      />
    </DashboardLayout>
  );
}
