/**
 * Authentication Store
 * Zustand store for managing authentication state
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import { secureLogger } from '@/lib/utils/secure-logger';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchCurrentUser: () => Promise<void>;
}

/**
 * Authentication store with session-based persistence
 * SECURITY: Only persists authentication flag, NOT user data (HIPAA compliance)
 */
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        setUser: (user) =>
          set({ user, isAuthenticated: user !== null, error: null }, false, 'auth/setUser'),

        clearUser: () =>
          set({ user: null, isAuthenticated: false, error: null }, false, 'auth/clearUser'),

        setLoading: (isLoading) =>
          set({ isLoading }, false, 'auth/setLoading'),

        setError: (error) =>
          set({ error }, false, 'auth/setError'),

        fetchCurrentUser: async () => {
          const { setUser, setLoading, setError } = get();

          setLoading(true);
          setError(null);

          try {
            // Import dynamically to avoid circular dependencies
            const { getCurrentUser } = await import('@/lib/auth');
            const user = getCurrentUser();

            if (user) {
              setUser(user);
            } else {
              setError('No user found');
            }
          } catch (error) {
            secureLogger.error('Failed to fetch current user:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch user');
            setUser(null);
          } finally {
            setLoading(false);
          }
        },
      }),
      {
        name: 'emr-auth-storage',
        storage: createJSONStorage(() => sessionStorage),
        // Only persist authentication flag, NOT user data (HIPAA compliance)
        partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
      }
    ),
    { name: 'AuthStore' }
  )
);
