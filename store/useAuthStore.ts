// store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile, Role } from '@/types/database';
import { INITIAL_PROFILES } from '@/lib/mock-data';

interface AuthState {
  currentProfile: Profile;
  setProfile: (profile: Profile) => void;
  setRole: (role: Role) => void;
  availableProfiles: Profile[];
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentProfile: INITIAL_PROFILES[0], // Defaults to Kasir
      availableProfiles: INITIAL_PROFILES,
      setProfile: (profile) => set({ currentProfile: profile }),
      setRole: (role) => {
        const found = INITIAL_PROFILES.find((p) => p.role === role);
        if (found) {
          set({ currentProfile: found });
        }
      },
    }),
    {
      name: 'buildpos-auth-storage',
    }
  )
);
