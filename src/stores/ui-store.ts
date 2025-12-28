/**
 * UI Store
 * Zustand store for managing UI state (sidebar, theme, etc.)
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Theme } from '@/types';

interface UIStore {
  // Sidebar state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Theme
  theme: Theme;

  // Loading state
  globalLoading: boolean;
  loadingMessage: string | null;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: Theme) => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
}

/**
 * UI store with persistence
 */
export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        sidebarOpen: true,
        sidebarCollapsed: false,
        theme: 'system',
        globalLoading: false,
        loadingMessage: null,

        // Actions
        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'ui/toggleSidebar'),

        setSidebarOpen: (open) =>
          set({ sidebarOpen: open }, false, 'ui/setSidebarOpen'),

        toggleSidebarCollapsed: () =>
          set(
            (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
            false,
            'ui/toggleSidebarCollapsed'
          ),

        setSidebarCollapsed: (collapsed) =>
          set({ sidebarCollapsed: collapsed }, false, 'ui/setSidebarCollapsed'),

        setTheme: (theme) =>
          set({ theme }, false, 'ui/setTheme'),

        setGlobalLoading: (loading, message) =>
          set(
            { globalLoading: loading, loadingMessage: message || null },
            false,
            'ui/setGlobalLoading'
          ),
      }),
      {
        name: 'emr-ui-storage',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          theme: state.theme,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);
