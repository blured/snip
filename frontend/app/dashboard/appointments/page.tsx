'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AppointmentModal } from '@/components/appointments/appointment-modal';
import { AppointmentCard } from '@/components/appointments/appointment-card';
import { useAppointments, useCancelAppointment, useDeleteAppointment } from '@/hooks/use-appointments';
import { Plus, Pencil, Trash2, Search, X, CheckSquare, Square, ChevronUp, ChevronDown, ChevronsUpDown, Filter, XCircle, List, LayoutGrid } from 'lucide-react';
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

type SortColumn = 'date' | 'client' | 'stylist' | 'status' | 'services' | null;
type SortDirection = 'asc' | 'desc' | null;
type ViewMode = 'card' | 'table';

interface AppointmentFilters {
  search: string;
  status: string;
  stylist: string;
  client: string;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const { data: appointments, isLoading, error } = useAppointments();
  const cancelAppointment = useCancelAppointment();
  const deleteAppointment = useDeleteAppointment();
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  // Filter state
  const [filters, setFilters] = useState<AppointmentFilters>({
    search: '',
    status: '',
    stylist: '',
    client: '',
  });

  // Sort state
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Get unique stylists and clients for filters
  const uniqueStylists = useMemo(() => {
    if (!appointments) return [];
    const stylists = new Map<string, { id: string; name: string }>();
    appointments.forEach((apt) => {
      const id = apt.stylist.id;
      const name = `${apt.stylist.user.firstName} ${apt.stylist.user.lastName}`;
      if (!stylists.has(id)) {
        stylists.set(id, { id, name });
      }
    });
    return Array.from(stylists.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [appointments]);

  const uniqueClients = useMemo(() => {
    if (!appointments) return [];
    const clients = new Map<string, { id: string; name: string }>();
    appointments.forEach((apt) => {
      const id = apt.client.id;
      const name = `${apt.client.user.firstName} ${apt.client.user.lastName}`;
      if (!clients.has(id)) {
        clients.set(id, { id, name });
      }
    });
    return Array.from(clients.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [appointments]);

  // Apply filters and sorting
  const filteredAndSortedAppointments = useMemo(() => {
    if (!appointments) return [];

    let result = [...appointments];

    // Apply filters
    result = result.filter((appointment) => {
      // Global search
      const searchLower = filters.search.toLowerCase();
      const clientName = `${appointment.client.user.firstName} ${appointment.client.user.lastName}`.toLowerCase();
      const stylistName = `${appointment.stylist.user.firstName} ${appointment.stylist.user.lastName}`.toLowerCase();
      const matchesSearch = !filters.search || (
        clientName.includes(searchLower) ||
        stylistName.includes(searchLower) ||
        appointment.client.user.email.toLowerCase().includes(searchLower) ||
        appointment.stylist.user.email.toLowerCase().includes(searchLower) ||
        (appointment.notes && appointment.notes.toLowerCase().includes(searchLower))
      );

      // Status filter
      const matchesStatus = !filters.status || appointment.status === filters.status;

      // Stylist filter
      const matchesStylist = !filters.stylist || appointment.stylist.id === filters.stylist;

      // Client filter
      const matchesClient = !filters.client || appointment.client.id === filters.client;

      return matchesSearch && matchesStatus && matchesStylist && matchesClient;
    });

    // Apply sorting
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        let comparison = 0;

        switch (sortColumn) {
          case 'date':
            const dateA = new Date(a.scheduledStart).getTime();
            const dateB = new Date(b.scheduledStart).getTime();
            comparison = dateA - dateB;
            break;
          case 'client':
            const aClient = `${a.client.user.firstName} ${a.client.user.lastName}`;
            const bClient = `${b.client.user.firstName} ${b.client.user.lastName}`;
            comparison = aClient.localeCompare(bClient);
            break;
          case 'stylist':
            const aStylist = `${a.stylist.user.firstName} ${a.stylist.user.lastName}`;
            const bStylist = `${b.stylist.user.firstName} ${b.stylist.user.lastName}`;
            comparison = aStylist.localeCompare(bStylist);
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
          case 'services':
            const aServices = a.services?.map((s: any) => s.service.name).join(', ') || '';
            const bServices = b.services?.map((s: any) => s.service.name).join(', ') || '';
            comparison = aServices.localeCompare(bServices);
            break;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [appointments, filters, sortColumn, sortDirection]);

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== false);
  const isAllSelected = filteredAndSortedAppointments.length > 0 && selectedIds.size === filteredAndSortedAppointments.length;
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
      stylist: '',
      client: '',
    });
    setSortColumn(null);
    setSortDirection(null);
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedAppointments.map(a => a.id)));
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

  const handleDeleteSelected = async () => {
    const count = selectedIds.size;
    if (count === 0) return;

    if (confirm(`Are you sure you want to delete ${count} appointment${count > 1 ? 's' : ''}?`)) {
      try {
        await Promise.all(
          Array.from(selectedIds).map(id => deleteAppointment.mutateAsync(id))
        );
        setSelectedIds(new Set());
      } catch {
        // Error is handled by the mutation hook
      }
    }
  };

  const handleCardClick = (appointment: Appointment) => {
    router.push(`/dashboard/appointments/${appointment.id}`);
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
            <CardTitle>
              All Appointments ({filteredAndSortedAppointments.length} of {appointments?.length ?? 0})
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
                    disabled={deleteAppointment.isPending}
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
                  placeholder="Search appointments..."
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {/* Status Filter */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="NO_SHOW">No Show</option>
                  </select>
                </div>

                {/* Stylist Filter */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Stylist</label>
                  <select
                    value={filters.stylist}
                    onChange={(e) => setFilters({ ...filters, stylist: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Stylists</option>
                    {uniqueStylists.map((stylist) => (
                      <option key={stylist.id} value={stylist.id}>
                        {stylist.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Client Filter */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Client</label>
                  <select
                    value={filters.client}
                    onChange={(e) => setFilters({ ...filters, client: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Clients</option>
                    {uniqueClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading appointments...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">Failed to load appointments</div>
            </div>
          ) : filteredAndSortedAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">
                {hasActiveFilters ? 'No appointments match your filters.' : 'No appointments yet. Schedule your first appointment to get started.'}
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
              {filteredAndSortedAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={(a) => { setSelectedAppointment(a); setShowModal(true); }}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
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
                        disabled={filteredAndSortedAppointments.length === 0}
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
                        onClick={() => handleSort('date')}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Date & Time
                        {getSortIcon('date')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('client')}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Client
                        {getSortIcon('client')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('stylist')}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Stylist
                        {getSortIcon('stylist')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('services')}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Services
                        {getSortIcon('services')}
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
                  {filteredAndSortedAppointments.map((appointment) => (
                    <TableRow
                      key={appointment.id}
                      className={selectedIds.has(appointment.id) ? 'bg-blue-50' : ''}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('select')) {
                          return;
                        }
                        router.push(`/dashboard/appointments/${appointment.id}`);
                      }}
                    >
                      <TableCell>
                        <button
                          onClick={() => handleSelectOne(appointment.id)}
                          className="flex items-center justify-center"
                        >
                          {selectedIds.has(appointment.id) ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </TableCell>
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
            </div>
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
