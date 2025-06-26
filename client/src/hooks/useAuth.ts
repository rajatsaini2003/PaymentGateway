
import { User } from '@/lib/types';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setHydrated: () => void;
  isTokenExpired: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem("auth_token");
        set({ user: null, token: null, isAuthenticated: false });
      },
      setHydrated: () => set({ hasHydrated: true }),
      isTokenExpired: () => {
        const user = get().user;
        if (!user?.tokenExpiresAt) return true;

        const expiry = new Date(user.tokenExpiresAt).getTime();
        return Date.now() > expiry;
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);