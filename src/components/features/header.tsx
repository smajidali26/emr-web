/**
 * Header Component
 * Dashboard header with search, notifications, and user menu
 */

'use client';

import { useState } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { UserMenu } from '@/components/features/user-profile';
import { useAuth } from '@/hooks';

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
  onMenuClick?: () => void;
}

export function Header({ title, children, onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const [notificationCount] = useState(3); // TODO: Connect to real notification system

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Mobile Menu Button */}
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Title or custom content */}
        <div className="flex-1">
          {title ? (
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          ) : (
            children
          )}
        </div>

        {/* Search */}
        <div className="hidden w-full max-w-sm md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search patients, records..."
              className="pl-10"
              aria-label="Search"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={`Notifications (${notificationCount} unread)`}
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <>
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
                <span className="sr-only">{notificationCount} unread notifications</span>
              </>
            )}
          </Button>

          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-3">
              {/* User Info - Hidden on mobile */}
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {user.roles && user.roles.length > 0 && (
                    <>{user.roles[0].replace('_', ' ')}</>
                  )}
                </p>
              </div>

              {/* User Avatar with Dropdown */}
              <UserMenu align="end" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
