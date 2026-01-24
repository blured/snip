'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ServiceModal } from '@/components/services/service-modal';
import { useServices, useDeleteService } from '@/hooks/use-services';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import type { Service } from '@/types';

export default function ServicesPage() {
  const { data: services, isLoading, error } = useServices();
  const deleteService = useDeleteService();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>();

  // Get unique categories
  const categories = services?.map((s) => s.category).filter((c, i, a) => a.indexOf(c) === i) || [];

  const filteredServices = services?.filter((service) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      service.name.toLowerCase().includes(searchLower) ||
      service.category.toLowerCase().includes(searchLower) ||
      (service.description && service.description.toLowerCase().includes(searchLower));

    const matchesCategory = !categoryFilter || service.category === categoryFilter;

    return matchesSearch && matchesCategory;
  }) ?? [];

  const handleDelete = async (service: Service) => {
    if (confirm(`Are you sure you want to delete "${service.name}"?`)) {
      try {
        await deleteService.mutateAsync(service.id);
      } catch {
        // Error is handled by the mutation hook
      }
    }
  };

  // Group services by category for display
  const groupedServices = filteredServices.reduce((acc: Record<string, Service[]>, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category]!.push(service);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">Manage services and pricing</p>
        </div>
        <Button onClick={() => { setSelectedService(undefined); setShowModal(true); }} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Service
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Services ({services?.length ?? 0})</CardTitle>
            <div className="flex gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search services..."
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
              <div className="text-gray-500">Loading services...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">Failed to load services</div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">
                {searchQuery || categoryFilter ? 'No services match your filters.' : 'No services yet. Add your first service to get started.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{service.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral">{service.category}</Badge>
                    </TableCell>
                    <TableCell>{service.durationMinutes} min</TableCell>
                    <TableCell>€{service.basePrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={service.active ? 'success' : 'neutral'}>
                        {service.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedService(service); setShowModal(true); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(service)}
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

      {/* Service Modal */}
      <ServiceModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedService(undefined); }}
        service={selectedService}
      />
    </DashboardLayout>
  );
}
