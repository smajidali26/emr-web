/**
 * Authentication Callback Page
 * Handles redirect after Azure AD B2C authentication
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleRedirectPromise } from '@/lib/auth';
import { Spinner } from '@/components/ui';

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const response = await handleRedirectPromise();

        if (response) {
          // Successfully authenticated, redirect to dashboard
          router.push('/dashboard');
        } else {
          // No response, might already be authenticated
          router.push('/');
        }
      } catch (err) {
        console.error('Authentication callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');

        // Redirect to login after error
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {error ? (
          <>
            <div className="rounded-full bg-destructive/10 p-3">
              <svg
                className="h-6 w-6 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-sm text-destructive">{error}</p>
            <p className="text-xs text-muted-foreground">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground">Completing authentication...</p>
          </>
        )}
      </div>
    </div>
  );
}
