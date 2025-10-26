import storage from '@/config/mmkv';
import { create } from 'zustand';

// Type definitions
interface DispatchRiderProfile {
  id: number;
  user_id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  vehicle_number: string;
  distance_km: number;
  status: 'available' | 'busy' | 'offline';
  rating: number;
  completed_deliveries: number;
  local_gov_area: string;
  state: string;
  created_at: string;
  firstname: string;
  lastname: string;
  phone_verified: boolean;
  profile_picture: string;
  updated_at?: string;
}

interface ProfileStore {
  profile: DispatchRiderProfile | null;
  isHydrated: boolean;

  // Actions
  setProfile: (profile: DispatchRiderProfile) => void;
  updateProfileFields: (updates: Partial<DispatchRiderProfile>) => void;
  clearProfile: () => void;
  hydrate: () => void;
}

// Storage keys
const PROFILE_STORAGE_KEY = 'dispatch_rider_profile';

// Helper functions for MMKV storage
const saveProfileToStorage = (profile: DispatchRiderProfile) => {
  try {
    storage.set(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save profile to MMKV:', error);
  }
};

const loadProfileFromStorage = (): DispatchRiderProfile | null => {
  try {
    const stored = storage.getString(PROFILE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load profile from MMKV:', error);
  }
  return null;
};

const clearProfileFromStorage = () => {
  try {
    storage.remove(PROFILE_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear profile from MMKV:', error);
  }
};

// Create Zustand store
const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  isHydrated: false,

  // Set entire profile and persist to MMKV
  setProfile: (profile) => {
    set({ profile });
    saveProfileToStorage(profile);
  },

  // Update specific fields and persist
  updateProfileFields: (updates) => {
    const currentProfile = get().profile;
    if (!currentProfile) {
      console.warn('Cannot update profile: no profile exists');
      return;
    }

    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    set({ profile: updatedProfile });
    saveProfileToStorage(updatedProfile);
  },

  // Clear profile from store and storage
  clearProfile: () => {
    set({ profile: null });
    clearProfileFromStorage();
  },

  // Hydrate from MMKV storage on app start
  hydrate: () => {
    const storedProfile = loadProfileFromStorage();
    set({ profile: storedProfile, isHydrated: true });
  },
}));

// Auto-hydrate on store creation
useProfileStore.getState().hydrate();

export default useProfileStore;
export type { DispatchRiderProfile, ProfileStore };
