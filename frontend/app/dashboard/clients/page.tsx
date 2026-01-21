'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClientModal } from '@/components/clients/client-modal';
import { useClients, useDeleteClient } from '@/hooks/use-clients';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import type { Client } from '@/types';

export default function ClientsPage() {
  const router = useRouter();
  const { data: clients, isLoading, error } = useClients();
  const deleteClient = useDeleteClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();

  const filteredClients = clients?.filter((client) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${client.user.firstName} ${client.user.lastName}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      client.user.email.toLowerCase().includes(searchLower) ||
      (client.user.phone && client.user.phone.includes(searchQuery))
    );
  }) ?? [];

  const handleDelete = async (client: Client) => {
    const clientName = `${client.user.firstName} ${client.user.lastName}`;
    if (confirm(`Are you sure you want to delete ${clientName}?`)) {
      try {
        await deleteClient.mutateAsync(client.id);
      } catch {
        // Error is handled by the mutation hook
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage client records and history</p>
        </div>
        <Button onClick={() => { setSelectedClient(undefined); setShowModal(true); }} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Clients ({clients?.length ?? 0})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search clients..."
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
              <div className="text-gray-500">Loading clients...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">Failed to load clients</div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">
                {searchQuery ? 'No clients match your search.' : 'No clients yet. Add your first client to get started.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Preferred Stylist</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow
                    key={client.id}
                    clickable
                    onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                  >
                    <TableCell className="font-medium">
                      {client.user.firstName} {client.user.lastName}
                    </TableCell>
                    <TableCell>{client.user.email}</TableCell>
                    <TableCell>{client.user.phone || '-'}</TableCell>
                    <TableCell>
                      {client.preferredStylist
                        ? `${client.preferredStylist.user.firstName} ${client.preferredStylist.user.lastName}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.user.active ? 'success' : 'neutral'}>
                        {client.user.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedClient(client); setShowModal(true); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(client)}
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

      {/* Client Modal */}
      <ClientModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedClient(undefined); }}
        client={selectedClient}
      />
    </DashboardLayout>
  );
}
