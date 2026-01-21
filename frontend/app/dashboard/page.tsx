'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, DollarSign, Scissors } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Today\'s Appointments',
      value: '12',
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Clients',
      value: '248',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Monthly Revenue',
      value: '$12,450',
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'Active Stylists',
      value: '8',
      icon: Scissors,
      color: 'bg-orange-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="flex items-center gap-4 py-6">
                <div className={`rounded-full p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">No appointments scheduled yet.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">No recent activity.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
