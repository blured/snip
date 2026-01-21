'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ServicesPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Services</h1>
        <p className="text-gray-600">Manage services and pricing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Services Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Service management coming soon.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
