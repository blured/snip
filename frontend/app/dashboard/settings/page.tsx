'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileForm } from '@/components/settings/profile-form';
import { PasswordForm } from '@/components/settings/password-form';
import { useAuth } from '@/hooks/use-auth';
import { User, Key, UserCircle, Shield } from 'lucide-react';

type SettingsTab = 'profile' | 'security';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showModal, setShowModal] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserCircle, description: 'Update your personal information' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Change your password' },
  ];

  const openModal = (tab: SettingsTab) => {
    setActiveTab(tab);
    setShowModal(true);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      {/* User Info Card */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <div className="ml-auto">
              <Badge variant="info">{user?.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Card
              key={tab.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => openModal(tab.id as SettingsTab)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{tab.label}</h3>
                    <p className="text-sm text-gray-500">{tab.description}</p>
                  </div>
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Settings Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeTab === 'profile' && 'Edit Profile'}
                {activeTab === 'security' && 'Change Password'}
              </h2>
            </div>
            <div className="px-6 py-4">
              {activeTab === 'profile' && <ProfileForm onCancel={() => setShowModal(false)} />}
              {activeTab === 'security' && <PasswordForm onCancel={() => setShowModal(false)} />}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
