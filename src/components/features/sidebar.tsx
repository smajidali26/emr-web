/**
 * Sidebar Navigation Component
 * Main navigation sidebar for the dashboard
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCog,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '@/hooks';
import { useUIStore } from '@/stores';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { UserRole } from '@/types';

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: Home },
  { id: 'patients', label: 'Patients', href: '/dashboard/patients', icon: Users },
  { id: 'appointments', label: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { id: 'records', label: 'Medical Records', href: '/dashboard/records', icon: FileText },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const adminNavigationItems = [
  { id: 'admin-roles', label: 'Roles & Permissions', href: '/admin/roles', icon: Shield },
  { id: 'admin-users', label: 'User Management', href: '/admin/users', icon: UserCog },
  { id: 'admin-audit', label: 'Audit Logs', href: '/admin/audit', icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!sidebarCollapsed && (
          <h1 className="text-xl font-bold text-primary">EMR</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebarCollapsed}
          className="ml-auto"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                sidebarCollapsed && 'justify-center'
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Admin Section - Only visible to users with admin role */}
        {user?.roles?.includes(UserRole.ADMIN) && (
          <>
            {!sidebarCollapsed && (
              <div className="mt-6 mb-2 px-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Administration
                </p>
              </div>
            )}
            {sidebarCollapsed && <div className="my-4 border-t" />}
            {adminNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    sidebarCollapsed && 'justify-center'
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="border-t p-4">
        {!sidebarCollapsed && user && (
          <div className="mb-3 space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn('w-full', sidebarCollapsed && 'px-2')}
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
