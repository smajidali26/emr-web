/**
 * Protected Route Component
 * Wrapper component that enforces authentication
 * SECURITY FIX: Prevent protected content flash before redirect
 * Assigned: Rachel Scott (8h)
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { UserRole } from '@/types';
import { Spinner } from '@/components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallbackUrl?: string;
}

/**
 * Protected route component
 * Redirects to login if not authenticated or if user lacks required roles
 * SECURITY FIX: Blocks rendering until auth check is complete to prevent content flash
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  fallbackUrl = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth();

  // SECURITY FIX: Track if auth check is complete to prevent content flash
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // SECURITY FIX: Only proceed with auth check when loading is complete
    if (!isLoading) {
      // Check authentication
      if (!isAuthenticated) {
        setAuthCheckComplete(true);
        setHasAccess(false);
        router.push(fallbackUrl);
        return;
      }

      // Check role requirements
      if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
        setAuthCheckComplete(true);
        setHasAccess(false);
        router.push('/unauthorized');
        return;
      }

      // User has access
      setAuthCheckComplete(true);
      setHasAccess(true);
    }
  }, [isAuthenticated, isLoading, requiredRoles, hasAnyRole, router, fallbackUrl]);

  // SECURITY FIX: Show loading state until auth check is complete
  // This prevents any flash of protected content before redirect
  if (isLoading || !authCheckComplete) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // SECURITY FIX: Only render children if auth check passed
  // Return null during redirect to prevent content flash
  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
