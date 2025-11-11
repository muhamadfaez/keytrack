import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser, User } from '@shared/types';
import { api } from '@/lib/api-client';
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: Pick<User, 'email' | 'password'>) => Promise<AuthUser>;
  signup: (userData: Pick<User, 'name' | 'email' | 'password'>) => Promise<AuthUser>;
  logout: () => void;
  setUser: (user: AuthUser) => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (credentials) => {
        const user = await api<AuthUser>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
        });
        set({ user, isAuthenticated: true });
        return user;
      },
      signup: async (userData) => {
        const user = await api<AuthUser>('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify(userData),
        });
        set({ user, isAuthenticated: true });
        return user;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      setUser: (user) => set((state) => ({ ...state, user })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.user;
        }
      },
    }
  )
);