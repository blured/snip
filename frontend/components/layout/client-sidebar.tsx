'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  User,
  FileText,
  Clock,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const clientNavigation = [
  { name: 'My Appointments', href: '/client-portal/appointments', icon: Calendar },
  { name: 'My Profile', href: '/client-portal/profile', icon: User },
  { name: 'My Invoices', href: '/client-portal/invoices', icon: FileText },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <div className="flex h-screen w-64 flex-col bg-gradient-to-b from-blue-600 to-blue-800 text-white">
      <div className="flex h-16 items-center justify-center border-b border-blue-500">
        <h1 className="text-xl font-bold">Client Portal</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {clientNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-900 text-white'
                  : 'text-blue-100 hover:bg-blue-900 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-blue-500 p-4">
        <div className="mb-3 text-sm">
          <p className="font-medium">{user?.firstName} {user?.lastName}</p>
          <p className="text-blue-200 text-xs">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-100 hover:bg-blue-900 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
