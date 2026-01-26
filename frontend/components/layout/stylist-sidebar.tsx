'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  Clock,
  Users,
  Scissors,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const stylistNavigation = [
  { name: 'My Schedule', href: '/stylist-portal/schedule', icon: Calendar },
  { name: 'My Appointments', href: '/stylist-portal/appointments', icon: Clock },
  { name: 'My Clients', href: '/stylist-portal/clients', icon: Users },
  { name: 'Services', href: '/stylist-portal/services', icon: Scissors },
];

export function StylistSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  // Close mobile menu when navigating
  const handleLinkClick = () => {
    window.dispatchEvent(new Event('closeMobileMenu'));
  };

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-purple-600 to-purple-800 text-white">
      <div className="flex h-16 items-center justify-between px-4 border-b border-purple-500">
        <h1 className="text-xl font-bold">Stylist Portal</h1>
        {/* Mobile close button */}
        <button
          onClick={handleLinkClick}
          className="lg:hidden p-2 rounded-lg hover:bg-purple-900 text-purple-100 hover:text-white"
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {stylistNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-[44px] ${
                isActive
                  ? 'bg-purple-900 text-white'
                  : 'text-purple-100 hover:bg-purple-900 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-purple-500 p-4">
        <div className="mb-3 text-sm">
          <p className="font-medium">{user?.firstName} {user?.lastName}</p>
          <p className="text-purple-200 text-xs">{user?.email}</p>
        </div>
        <button
          onClick={() => {
            logout();
            handleLinkClick();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-purple-100 hover:bg-purple-900 hover:text-white min-h-[44px]"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          Logout
        </button>
        <p className="mt-3 text-xs text-purple-200 text-center">v1.0.0</p>
      </div>
    </div>
  );
}
