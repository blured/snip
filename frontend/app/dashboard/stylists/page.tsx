'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StylistsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Stylists</h1>
        <p className="text-gray-600">Manage stylists and schedules</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stylist Team</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Stylist management coming soon.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
