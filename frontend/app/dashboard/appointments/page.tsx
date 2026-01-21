'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AppointmentsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-600">Manage appointments and scheduling</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointments Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Calendar view coming soon.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
