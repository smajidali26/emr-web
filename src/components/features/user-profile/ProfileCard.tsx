/**
 * Profile Card Component
 * Displays user profile information in a card format
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { UserAvatar } from './UserAvatar';
import { User, UserRole } from '@/types';
import { Mail, Phone, Shield, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProfileCardProps {
  user: User;
  className?: string;
  showActions?: boolean;
}

/**
 * Format user role for display
 */
function formatRole(role: UserRole): string {
  const roleMap: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.DOCTOR]: 'Doctor',
    [UserRole.NURSE]: 'Nurse',
    [UserRole.RECEPTIONIST]: 'Receptionist',
    [UserRole.PHARMACIST]: 'Pharmacist',
    [UserRole.LAB_TECHNICIAN]: 'Lab Technician',
  };

  return roleMap[role] || role;
}

/**
 * Get role badge color
 */
function getRoleBadgeColor(role: UserRole): string {
  const colorMap: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'bg-red-100 text-red-800 border-red-200',
    [UserRole.DOCTOR]: 'bg-blue-100 text-blue-800 border-blue-200',
    [UserRole.NURSE]: 'bg-green-100 text-green-800 border-green-200',
    [UserRole.RECEPTIONIST]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [UserRole.PHARMACIST]: 'bg-purple-100 text-purple-800 border-purple-200',
    [UserRole.LAB_TECHNICIAN]: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  return colorMap[role] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function ProfileCard({ user, className }: ProfileCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <UserAvatar
            name={user.name}
            email={user.email}
            avatarUrl={user.avatarUrl}
            size="xl"
          />
          <div className="flex-1 space-y-1">
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className={cn(
                      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
                      getRoleBadgeColor(role)
                    )}
                  >
                    {formatRole(role)}
                  </span>
                ))}
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {/* Email */}
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{user.email}</span>
          </div>

          {/* Phone */}
          {user.phoneNumber && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{user.phoneNumber}</span>
            </div>
          )}

          {/* Tenant ID */}
          {user.tenantId && (
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tenant ID:</span>
              <span className="font-mono text-xs">{user.tenantId}</span>
            </div>
          )}

          {/* User ID */}
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">User ID:</span>
            <span className="font-mono text-xs">{user.id}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
