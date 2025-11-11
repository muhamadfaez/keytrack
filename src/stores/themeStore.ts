import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
export type Theme = "light" | "dark" | "system";
export type ColorScheme = "default" | "iium";
interface ThemeState {
  theme: Theme;
  colorScheme: ColorScheme;
  setTheme: (theme: Theme) => void;
  setColorScheme: (colorScheme: ColorScheme) => void;
}
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      colorScheme: 'default',
      setTheme: (theme) => set({ theme }),
      setColorScheme: (colorScheme) => set({ colorScheme }),
    }),
    {
      name: 'keytrack-theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);