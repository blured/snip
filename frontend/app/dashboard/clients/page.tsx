'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClientModal } from '@/components/clients/client-modal';
import { ClientCard } from '@/components/clients/client-card';
import { ChangePasswordModal } from '@/components/auth/change-password-modal';
import { useClients, useDeleteClient } from '@/hooks/use-clients';
import { Plus, Pencil, Trash2, Search, CheckSquare, Square, ChevronUp, ChevronDown, ChevronsUpDown, Filter, XCircle, List, LayoutGrid } from 'lucide-react';
import type { Client } from '@/types';

type SortColumn = 'name' | 'email' | 'phone' | 'preferredStylist' | 'status' | null;
type SortDirection = 'asc' | 'desc' | null;
type ViewMode = 'card' | 'table';

interface ClientFilters {
  search: string;
  status: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: clients, isLoading, error } = useClients();
  const deleteClient = useDeleteClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [clientForPassword, setClientForPassword] = useState<Client | undefined>();

  // Filter state
  const [filters, setFilters] = useState<ClientFilters>({
    search: '',
    status: '',
  });

  // Sort state
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Redirect clients away from this page
  useEffect(() => {
    if (isAuthenticated && user?.role === 'CLIENT') {
      router.push('/client-portal/appointments');
    }
  }, [isAuthenticated, user, router]);

  // Apply filters and sorting
  const filteredAndSortedClients = useMemo(() => {
    if (!clients) return [];

    let result = [...clients];

    // Apply filters
    result = result.filter((client) => {
      // Global search
      const searchLower = filters.search.toLowerCase();
      const fullName = `${client.user.firstName} ${client.user.lastName}`.toLowerCase();
      const matchesSearch = !filters.search || (
        fullName.includes(searchLower) ||
        client.user.email.toLowerCase().includes(searchLower) ||
        (client.user.phone && client.user.phone.includes(filters.search)) ||
        (client.notes && client.notes.toLowerCase().includes(searchLower))
      );

      // Status filter
      const matchesStatus = filters.status === '' ||
        (filters.status === 'active' && client.user.active) ||
        (filters.status === 'inactive' && !client.user.active);

      return matchesSearch && matchesStatus;
    });

    // Apply sorting
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        let comparison = 0;

        switch (sortColumn) {
          case 'name':
            const aName = `${a.user.firstName} ${a.user.lastName}`;
            const bName = `${b.user.firstName} ${b.user.lastName}`;
            comparison = aName.localeCompare(bName);
            break;
          case 'email':
            comparison = a.user.email.localeCompare(b.user.email);
            break;
          case 'phone':
            comparison = (a.user.phone || '').localeCompare(b.user.phone || '');
            break;
          case 'preferredStylist':
            const aStylist = a.preferredStylist
              ? `${a.preferredStylist.user.firstName} ${a.preferredStylist.user.lastName}`
              : '';
            const bStylist = b.preferredStylist
              ? `${b.preferredStylist.user.firstName} ${b.preferredStylist.user.lastName}`
              : '';
            comparison = aStylist.localeCompare(bStylist);
            break;
          case 'status':
            comparison = (a.user.active ? 1 : 0) - (b.user.active ? 1 : 0);
            break;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [clients, filters, sortColumn, sortDirection]);

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== false);
  const isAllSelected = filteredAndSortedClients.length > 0 && selectedIds.size === filteredAndSortedClients.length;
  const isSomeSelected = selectedIds.size > 0;

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="h-4 w-4 text-blue-600" />;
    }
    if (sortDirection === 'desc') {
      return <ChevronDown className="h-4 w-4 text-blue-600" />;
    }
    return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
    });
    setSortColumn(null);
    setSortDirection(null);
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedClients.map(c => c.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

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

  const handleDeleteSelected = async () => {
    const count = selectedIds.size;
    if (count === 0) return;

    if (confirm(`Are you sure you want to delete ${count} client${count > 1 ? 's' : ''}?`)) {
      try {
        await Promise.all(
          Array.from(selectedIds).map(id => deleteClient.mutateAsync(id))
        );
        setSelectedIds(new Set());
      } catch {
        // Error is handled by the mutation hook
      }
    }
  };

  const handleCardClick = (client: Client) => {
    router.push(`/dashboard/clients/${client.id}`);
  };

  const handleChangePassword = (client: Client) => {
    setClientForPassword(client);
    setShowPasswordModal(true);
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
            <CardTitle>
              All Clients ({filteredAndSortedClients.length} of {clients?.length ?? 0})
            </CardTitle>
            <div className="flex gap-3">
              {/* View Toggle */}
              <div className="flex items-center rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('card')}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === 'card'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Table View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Only show bulk select in table mode */}
              {viewMode === 'table' && isSomeSelected && (
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedIds.size} selected
                  </span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDeleteSelected}
                    disabled={deleteClient.isPending}
                    className="h-7 gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={hasActiveFilters ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : ''}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                    {Object.values(filters).filter(v => v !== '' && v !== false).length}
                  </span>
                )}
              </Button>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search clients..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Filters</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-8 text-gray-600 hover:text-gray-900"
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Clear All
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Status Filter */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading clients...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">Failed to load clients</div>
            </div>
          ) : filteredAndSortedClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">
                {hasActiveFilters ? 'No clients match your filters.' : 'No clients yet. Add your first client to get started.'}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="secondary"
                  onClick={handleClearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : viewMode === 'card' ? (
            /* Card View */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredAndSortedClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onEdit={(c) => { setSelectedClient(c); setShowModal(true); }}
                  onDelete={handleDelete}
                  onChangePassword={user?.role === 'ADMIN' ? handleChangePassword : undefined}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center justify-center"
                        disabled={filteredAndSortedClients.length === 0}
                      >
                        {isAllSelected ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Name
                        {getSortIcon('name')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Email
                        {getSortIcon('email')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('phone')}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Phone
                        {getSortIcon('phone')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('preferredStylist')}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Preferred Stylist
                        {getSortIcon('preferredStylist')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Status
                        {getSortIcon('status')}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedClients.map((client) => (
                    <TableRow
                      key={client.id}
                      className={selectedIds.has(client.id) ? 'bg-blue-50' : ''}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('select')) {
                          return;
                        }
                        router.push(`/dashboard/clients/${client.id}`);
                      }}
                    >
                      <TableCell>
                        <button
                          onClick={() => handleSelectOne(client.id)}
                          className="flex items-center justify-center"
                        >
                          {selectedIds.has(client.id) ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </TableCell>
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Modal */}
      <ClientModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedClient(undefined); }}
        client={selectedClient}
      />

      {/* Change Password Modal */}
      {clientForPassword && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => { setShowPasswordModal(false); setClientForPassword(undefined); }}
          userName={`${clientForPassword.user.firstName} ${clientForPassword.user.lastName}`}
          userId={clientForPassword.user.id}
        />
      )}
    </DashboardLayout>
  );
}
