'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from './sidebar';
import { ClientSidebar } from './client-sidebar';
import { StylistSidebar } from './stylist-sidebar';
import { UserRole } from '@/types';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Determine which sidebar to show based on user role
  const getSidebar = () => {
    switch (user.role) {
      case UserRole.CLIENT:
        return <ClientSidebar />;
      case UserRole.STYLIST:
        return <StylistSidebar />;
      case UserRole.ADMIN:
      default:
        return <Sidebar />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {getSidebar()}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
