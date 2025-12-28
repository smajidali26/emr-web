/**
 * Role Detail Page
 * Page for viewing and managing individual role permissions
 */

'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Spinner,
  Alert,
  Checkbox,
  Label,
} from '@/components/ui';
import { rolesApi } from '@/lib/api';
import { Permission, PermissionDto, PermissionCategory } from '@/types';
import { cn } from '@/lib/utils';

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const roleId = params.id as string;

  const [selectedPermissions, setSelectedPermissions] = React.useState<Set<Permission>>(
    new Set()
  );
  const [hasChanges, setHasChanges] = React.useState(false);

  // Fetch role details
  const {
    data: role,
    isLoading: isLoadingRole,
    isError: isRoleError,
    error: roleError,
  } = useQuery({
    queryKey: ['role', roleId],
    queryFn: () => rolesApi.getRoleById(roleId),
  });

  // Fetch all permissions
  const {
    data: allPermissions,
    isLoading: isLoadingPermissions,
  } = useQuery({
    queryKey: ['permissions'],
    queryFn: rolesApi.getAllPermissions,
  });

  // Mutation for saving permissions
  const saveMutation = useMutation({
    mutationFn: (permissions: Permission[]) =>
      rolesApi.assignPermissionsToRole(roleId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role', roleId] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setHasChanges(false);
    },
  });

  // Initialize selected permissions when role loads
  React.useEffect(() => {
    if (role?.permissions) {
      setSelectedPermissions(new Set(role.permissions));
    }
  }, [role?.permissions]);

  const handlePermissionToggle = (permission: Permission) => {
    if (role?.isSystemRole) return;

    const newPermissions = new Set(selectedPermissions);
    if (newPermissions.has(permission)) {
      newPermissions.delete(permission);
    } else {
      newPermissions.add(permission);
    }
    setSelectedPermissions(newPermissions);
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(Array.from(selectedPermissions));
  };

  const handleBack = () => {
    router.push('/admin/roles');
  };

  // Group permissions by category
  const permissionsByCategory = React.useMemo(() => {
    if (!allPermissions) return new Map<PermissionCategory, PermissionDto[]>();

    const grouped = new Map<PermissionCategory, PermissionDto[]>();
    allPermissions.forEach((permission) => {
      const category = permission.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(permission);
    });
    return grouped;
  }, [allPermissions]);

  const isLoading = isLoadingRole || isLoadingPermissions;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isRoleError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="ml-2">
            Failed to load role: {(roleError as Error)?.message || 'Unknown error'}
          </span>
        </Alert>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="ml-2">Role not found</span>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{role.displayName}</h1>
                {role.isSystemRole && (
                  <Badge variant="secondary">
                    <Lock className="mr-1 h-3 w-3" />
                    System Role
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{role.description}</p>
            </div>
          </div>
        </div>
        {!role.isSystemRole && (
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        )}
      </div>

      {/* Success/Error Messages */}
      {saveMutation.isSuccess && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <span className="ml-2">Permissions saved successfully</span>
        </Alert>
      )}
      {saveMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="ml-2">
            Failed to save permissions: {(saveMutation.error as Error)?.message}
          </span>
        </Alert>
      )}

      {/* System Role Warning */}
      {role.isSystemRole && (
        <Alert>
          <Lock className="h-4 w-4" />
          <span className="ml-2">
            System roles cannot be modified. These permissions are managed by the system.
          </span>
        </Alert>
      )}

      {/* Role Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Selected Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedPermissions.size}</div>
            <p className="text-xs text-muted-foreground">
              out of {allPermissions?.length || 0} available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Permission Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissionsByCategory.size}</div>
            <p className="text-xs text-muted-foreground">categories covered</p>
          </CardContent>
        </Card>
      </div>

      {/* Permissions by Category */}
      <div className="space-y-6">
        {Array.from(permissionsByCategory.entries()).map(([category, permissions]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>
                {permissions.filter((p) => selectedPermissions.has(p.name)).length} of{' '}
                {permissions.length} permissions selected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {permissions.map((permission) => (
                  <PermissionCheckbox
                    key={permission.name}
                    permission={permission}
                    checked={selectedPermissions.has(permission.name)}
                    disabled={role.isSystemRole}
                    onToggle={() => handlePermissionToggle(permission.name)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface PermissionCheckboxProps {
  permission: PermissionDto;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}

function PermissionCheckbox({
  permission,
  checked,
  disabled,
  onToggle,
}: PermissionCheckboxProps) {
  const id = `permission-${permission.name}`;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 transition-colors',
        checked && 'border-primary bg-primary/5',
        disabled && 'opacity-60'
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onToggle}
        aria-describedby={`${id}-description`}
      />
      <div className="flex-1">
        <Label
          htmlFor={id}
          className={cn('font-medium', disabled && 'cursor-not-allowed')}
        >
          {permission.displayName}
        </Label>
        <p id={`${id}-description`} className="text-sm text-muted-foreground">
          {permission.description}
        </p>
      </div>
    </div>
  );
}
