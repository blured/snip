'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StylistModal } from '@/components/stylists/stylist-modal';
import { StylistCard } from '@/components/stylists/stylist-card';
import { useStylists, useDeleteStylist } from '@/hooks/use-stylists';
import { Plus, Pencil, Trash2, Search, CheckSquare, Square, ChevronUp, ChevronDown, ChevronsUpDown, Filter, XCircle, List, LayoutGrid } from 'lucide-react';
import type { Stylist } from '@/types';

type SortColumn = 'name' | 'email' | 'phone' | 'specialties' | 'rate' | 'status' | null;
type SortDirection = 'asc' | 'desc' | null;
type ViewMode = 'card' | 'table';

interface StylistFilters {
  search: string;
  minRate: string;
  maxRate: string;
  status: string;
}

export default function StylistsPage() {
  const router = useRouter();
  const { data: stylists, isLoading, error } = useStylists();
  const deleteStylist = useDeleteStylist();
  const [showModal, setShowModal] = useState(false);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  // Filter state
  const [filters, setFilters] = useState<StylistFilters>({
    search: '',
    minRate: '',
    maxRate: '',
    status: '',
  });

  // Sort state
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Apply filters and sorting
  const filteredAndSortedStylists = useMemo(() => {
    if (!stylists) return [];

    let result = [...stylists];

    // Apply filters
    result = result.filter((stylist) => {
      // Global search
      const searchLower = filters.search.toLowerCase();
      const fullName = `${stylist.user.firstName} ${stylist.user.lastName}`.toLowerCase();
      const matchesSearch = !filters.search || (
        fullName.includes(searchLower) ||
        stylist.user.email.toLowerCase().includes(searchLower) ||
        (stylist.user.phone && stylist.user.phone.includes(filters.search)) ||
        (stylist.specialties && stylist.specialties.toLowerCase().includes(searchLower))
      );

      // Rate range filter
      let matchesRateRange = true;
      if (filters.minRate) {
        matchesRateRange = matchesRateRange && (stylist.hourlyRate ?? 0) >= parseFloat(filters.minRate);
      }
      if (filters.maxRate) {
        matchesRateRange = matchesRateRange && (stylist.hourlyRate ?? 0) <= parseFloat(filters.maxRate);
      }

      // Status filter
      const matchesStatus = filters.status === '' ||
        (filters.status === 'active' && stylist.active) ||
        (filters.status === 'inactive' && !stylist.active);

      return matchesSearch && matchesRateRange && matchesStatus;
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
          case 'specialties':
            comparison = (a.specialties || '').localeCompare(b.specialties || '');
            break;
          case 'rate':
            const aRate = a.hourlyRate || 0;
            const bRate = b.hourlyRate || 0;
            comparison = aRate - bRate;
            break;
          case 'status':
            comparison = (a.active ? 1 : 0) - (b.active ? 1 : 0);
            break;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [stylists, filters, sortColumn, sortDirection]);

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== false);
  const isAllSelected = filteredAndSortedStylists.length > 0 && selectedIds.size === filteredAndSortedStylists.length;
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
      minRate: '',
      maxRate: '',
      status: '',
    });
    setSortColumn(null);
    setSortDirection(null);
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedStylists.map(s => s.id)));
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

  const handleDeleteSelected = async () => {
    const count = selectedIds.size;
    if (count === 0) return;

    if (confirm(`Are you sure you want to delete ${count} stylist${count > 1 ? 's' : ''}?`)) {
      try {
        await Promise.all(
          Array.from(selectedIds).map(id => deleteStylist.mutateAsync(id))
        );
        setSelectedIds(new Set());
      } catch {
        // Error is handled by the mutation hook
      }
    }
  };

  const handleCardClick = (stylist: Stylist) => {
    router.push(`/dashboard/stylists/${stylist.id}`);
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
            <CardTitle>
              All Stylists ({filteredAndSortedStylists.length} of {stylists?.length ?? 0})
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
                    disabled={deleteStylist.isPending}
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
                  placeholder="Search stylists..."
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
                {/* Min Rate Filter */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Min Hourly Rate (€)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Min rate"
                    value={filters.minRate}
                    onChange={(e) => setFilters({ ...filters, minRate: e.target.value })}
                    className="w-full"
                  />
                </div>

                {/* Max Rate Filter */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Max Hourly Rate (€)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Max rate"
                    value={filters.maxRate}
                    onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                    className="w-full"
                  />
                </div>

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
              <div className="text-gray-500">Loading stylists...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">Failed to load stylists</div>
            </div>
          ) : filteredAndSortedStylists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">
                {hasActiveFilters ? 'No stylists match your filters.' : 'No stylists yet. Add your first stylist to get started.'}
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
              {filteredAndSortedStylists.map((stylist) => (
                <StylistCard
                  key={stylist.id}
                  stylist={stylist}
                  onEdit={(s) => { setSelectedStylist(s); setShowModal(true); }}
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
                        disabled={filteredAndSortedStylists.length === 0}
                      >
                        {isAllSelected ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>Photo</TableHead>
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
                        onClick={() => handleSort('specialties')}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Specialties
                        {getSortIcon('specialties')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('rate')}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Hourly Rate
                        {getSortIcon('rate')}
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
                  {filteredAndSortedStylists.map((stylist) => (
                    <TableRow
                      key={stylist.id}
                      className={selectedIds.has(stylist.id) ? 'bg-blue-50' : ''}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('select')) {
                          return;
                        }
                        router.push(`/dashboard/stylists/${stylist.id}`);
                      }}
                    >
                      <TableCell>
                        <button
                          onClick={() => handleSelectOne(stylist.id)}
                          className="flex items-center justify-center"
                        >
                          {selectedIds.has(stylist.id) ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        {stylist.photo ? (
                          <img
                            src={stylist.photo}
                            alt={`${stylist.user.firstName} ${stylist.user.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                            <span className="text-sm font-medium text-gray-600">
                              {stylist.user.firstName[0]}{stylist.user.lastName[0]}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {stylist.user.firstName} {stylist.user.lastName}
                      </TableCell>
                      <TableCell>{stylist.user.email}</TableCell>
                      <TableCell>{stylist.user.phone || '-'}</TableCell>
                      <TableCell>{stylist.specialties || '-'}</TableCell>
                      <TableCell>
                        {stylist.hourlyRate ? `€${stylist.hourlyRate.toFixed(2)}/hr` : '-'}
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
            </div>
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
