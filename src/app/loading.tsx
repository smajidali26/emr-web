/**
 * Loading Page
 * Global loading state for Next.js routes
 */

import { Spinner } from '@/components/ui';

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
