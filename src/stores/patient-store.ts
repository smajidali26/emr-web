/**
 * Patient Store
 * Zustand store for managing patient state
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Patient, PatientSearchFilters } from '@/types';

interface PatientStore {
  // State
  selectedPatient: Patient | null;
  recentPatients: Patient[];
  searchFilters: PatientSearchFilters;
  isPatientPanelOpen: boolean;

  // Actions
  setSelectedPatient: (patient: Patient | null) => void;
  addRecentPatient: (patient: Patient) => void;
  clearRecentPatients: () => void;
  setSearchFilters: (filters: PatientSearchFilters) => void;
  clearSearchFilters: () => void;
  setPatientPanelOpen: (isOpen: boolean) => void;
  togglePatientPanel: () => void;
}

/**
 * Patient store
 * Manages patient-related UI state and recent patient history
 */
export const usePatientStore = create<PatientStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      selectedPatient: null,
      recentPatients: [],
      searchFilters: {},
      isPatientPanelOpen: false,

      // Set selected patient
      setSelectedPatient: (patient) =>
        set({ selectedPatient: patient }, false, 'patient/setSelectedPatient'),

      // Add patient to recent patients list (max 10)
      addRecentPatient: (patient) => {
        const { recentPatients } = get();
        const filtered = recentPatients.filter((p) => p.id !== patient.id);
        const updated = [patient, ...filtered].slice(0, 10);
        set({ recentPatients: updated }, false, 'patient/addRecentPatient');
      },

      // Clear recent patients
      clearRecentPatients: () =>
        set({ recentPatients: [] }, false, 'patient/clearRecentPatients'),

      // Set search filters
      setSearchFilters: (filters) =>
        set({ searchFilters: filters }, false, 'patient/setSearchFilters'),

      // Clear search filters
      clearSearchFilters: () =>
        set({ searchFilters: {} }, false, 'patient/clearSearchFilters'),

      // Set patient panel visibility
      setPatientPanelOpen: (isOpen) =>
        set({ isPatientPanelOpen: isOpen }, false, 'patient/setPatientPanelOpen'),

      // Toggle patient panel
      togglePatientPanel: () => {
        const { isPatientPanelOpen } = get();
        set({ isPatientPanelOpen: !isPatientPanelOpen }, false, 'patient/togglePatientPanel');
      },
    }),
    { name: 'PatientStore' }
  )
);
