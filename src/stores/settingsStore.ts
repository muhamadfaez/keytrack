import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
interface NotificationPreferences {
  overdueKeys: boolean;
  keyReturns: boolean;
  keyIssues: boolean;
}
interface AuthPreferences {
  enableGoogleAuth: boolean;
}
interface SettingsState {
  notifications: NotificationPreferences;
  auth: AuthPreferences;
  toggleOverdueKeys: () => void;
  toggleKeyReturns: () => void;
  toggleKeyIssues: () => void;
  toggleGoogleAuth: () => void;
}
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: {
        overdueKeys: true,
        keyReturns: true,
        keyIssues: false,
      },
      auth: {
        enableGoogleAuth: true,
      },
      toggleOverdueKeys: () =>
        set((state) => ({
          notifications: { ...state.notifications, overdueKeys: !state.notifications.overdueKeys },
        })),
      toggleKeyReturns: () =>
        set((state) => ({
          notifications: { ...state.notifications, keyReturns: !state.notifications.keyReturns },
        })),
      toggleKeyIssues: () =>
        set((state) => ({
          notifications: { ...state.notifications, keyIssues: !state.notifications.keyIssues },
        })),
      toggleGoogleAuth: () =>
        set((state) => ({
          auth: { ...state.auth, enableGoogleAuth: !state.auth.enableGoogleAuth },
        })),
    }),
    {
      name: 'keytrack-settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);