// store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile, Role } from '@/types/database';
import { INITIAL_PROFILES } from '@/lib/mock-data';

interface AuthState {
  isAuthenticated: boolean;
  currentProfile: Profile | null;
  login: (profile: Profile) => void;
  logout: () => void;
  setProfile: (profile: Profile) => void;
  setRole: (role: Role) => void;
  availableProfiles: Profile[];
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      currentProfile: null,
      availableProfiles: INITIAL_PROFILES,
      
      login: (profile: Profile) => {
        set({
          isAuthenticated: true,
          currentProfile: profile,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          currentProfile: null,
        });
      },

      setProfile: (profile) => set({ currentProfile: profile, isAuthenticated: true }),
      
      setRole: (role) => {
        const found = INITIAL_PROFILES.find((p) => p.role === role);
        if (found) {
          set({ currentProfile: found, isAuthenticated: true });
        }
      },
    }),
    {
      name: 'buildpos-auth-storage',
    }
  )
);
