/**
 * Application Providers
 * Wraps the app with all necessary context providers
 * SECURITY FIX: Added error boundary for graceful error handling
 * Assigned: Justin Baker (6h)
 */

'use client';

import React, { useEffect, useState } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/api';
import { initializeMsal } from '@/lib/auth';
import { PublicClientApplication } from '@azure/msal-browser';
import { Spinner } from '@/components/ui';
import { ErrorBoundary } from '@/components/error-boundary';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers component that wraps the entire application
 */
export function Providers({ children }: ProvidersProps) {
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const instance = await initializeMsal();
        setMsalInstance(instance);
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, []);

  if (isInitializing || !msalInstance) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <MsalProvider instance={msalInstance}>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </MsalProvider>
    </ErrorBoundary>
  );
}
