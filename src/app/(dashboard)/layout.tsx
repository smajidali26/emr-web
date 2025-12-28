/**
 * Dashboard Layout
 * Main layout for authenticated dashboard pages
 * SECURITY FIX: Task #2648 - Added error boundary to prevent crashes
 */

'use client';

import { ProtectedRoute, Sidebar, Header } from '@/components/features';
import { ErrorBoundary } from '@/components/error-boundary';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {/* SECURITY FIX: Wrap children in error boundary to catch rendering errors */}
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
