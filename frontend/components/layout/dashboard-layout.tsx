'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from './sidebar';
import { ClientSidebar } from './client-sidebar';
import { StylistSidebar } from './stylist-sidebar';
import { UserRole } from '@/types';
import { Menu, X } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Listen for mobile menu close events
  useEffect(() => {
    const handleCloseMenu = () => setMobileMenuOpen(false);
    window.addEventListener('closeMobileMenu', handleCloseMenu);
    return () => window.removeEventListener('closeMobileMenu', handleCloseMenu);
  }, []);

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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - slide-in drawer on mobile, fixed on desktop */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[80%] max-w-[280px] lg:w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {getSidebar()}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
          <h1 className="text-lg font-bold text-gray-900">Salon Manager</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
