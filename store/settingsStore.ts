import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  isAmbientBackgroundEnabled: boolean;
  setAmbientBackgroundEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isSoundEnabled: true,
      toggleSound: () =>
        set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
      setSoundEnabled: (enabled: boolean) => set({ isSoundEnabled: enabled }),

      isAmbientBackgroundEnabled: true,
      setAmbientBackgroundEnabled: (enabled: boolean) =>
        set({ isAmbientBackgroundEnabled: enabled }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
