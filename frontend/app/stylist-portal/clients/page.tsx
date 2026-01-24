'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useClients } from '@/hooks/use-clients';

export default function StylistClientsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { data: clients, isLoading, error } = useClients();

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

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Clients</h1>
        <p className="text-gray-600">View your client list</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading clients...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-red-500">Failed to load clients</div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients?.map((client: any) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    {client.user.firstName} {client.user.lastName}
                  </TableCell>
                  <TableCell>{client.user.email}</TableCell>
                  <TableCell>{client.user.phone || '-'}</TableCell>
                  <TableCell className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                    {client.notes || '-'}
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
