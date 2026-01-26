'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  CalendarDays,
  Users,
  Scissors,
  Receipt,
  Settings,
  LayoutDashboard,
  FileText,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Schedule', href: '/dashboard/schedule', icon: CalendarDays },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Stylists', href: '/dashboard/stylists', icon: Scissors },
  { name: 'Services', href: '/dashboard/services', icon: FileText },
  { name: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  // Close mobile menu when navigating
  const handleLinkClick = () => {
    // Emit event for parent to close menu
    window.dispatchEvent(new Event('closeMobileMenu'));
  };

  return (
    <div className="flex h-full w-full flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Salon Manager</h1>
        {/* Mobile close button */}
        <button
          onClick={handleLinkClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-[44px] ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <div className="mb-3 text-sm">
          <p className="font-medium">{user?.firstName} {user?.lastName}</p>
          <p className="text-gray-400">{user?.email}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role.toLowerCase()}</p>
        </div>
        <button
          onClick={() => {
            logout();
            handleLinkClick();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white min-h-[44px]"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          Logout
        </button>
        <p className="mt-3 text-xs text-gray-500 text-center">v1.0.0</p>
      </div>
    </div>
  );
}
