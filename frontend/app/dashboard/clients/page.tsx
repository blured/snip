'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-600">Manage client records and history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clients List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Client management coming soon.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
