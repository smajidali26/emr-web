/**
 * Admin Roles Management Page
 * Page for viewing and managing system roles and permissions
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Shield,
  Users,
  Lock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Spinner,
  Alert,
} from '@/components/ui';
import { rolesApi } from '@/lib/api';
import { RoleDto } from '@/types';
import { cn } from '@/lib/utils';

export default function AdminRolesPage() {
  const router = useRouter();

  const {
    data: roles,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getAllRoles,
  });

  const handleRoleClick = (roleId: string) => {
    router.push(`/admin/roles/${roleId}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="ml-2">
            Failed to load roles: {(error as Error)?.message || 'Unknown error'}
          </span>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
              <p className="text-muted-foreground">
                Manage system roles and their associated permissions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Roles</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles?.filter((r) => r.isSystemRole).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Roles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles?.filter((r) => !r.isSystemRole).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles List */}
      <Card>
        <CardHeader>
          <CardTitle>All Roles</CardTitle>
          <CardDescription>
            Click on a role to view and manage its permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {roles?.map((role) => (
              <RoleListItem
                key={role.id}
                role={role}
                onClick={() => handleRoleClick(role.id)}
              />
            ))}
            {(!roles || roles.length === 0) && (
              <p className="py-8 text-center text-muted-foreground">
                No roles found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface RoleListItemProps {
  role: RoleDto;
  onClick: () => void;
}

function RoleListItem({ role, onClick }: RoleListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors',
        'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
      )}
      aria-label={`View ${role.displayName} role`}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            role.isSystemRole ? 'bg-primary/10' : 'bg-secondary'
          )}
        >
          {role.isSystemRole ? (
            <Lock className="h-5 w-5 text-primary" />
          ) : (
            <Shield className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{role.displayName}</h3>
            {role.isSystemRole && (
              <Badge variant="secondary" className="text-xs">
                System
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{role.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {role.permissions.length} permissions
            {role.userCount !== undefined && ` | ${role.userCount} users`}
          </p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  );
}
