import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import {
  useColorScheme as useNativeColorScheme,
  ColorSchemeName,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
  colorScheme: ColorSchemeName;
}

export const ThemeContext = createContext<ThemeContextType>({
  themePreference: 'system',
  setThemePreference: () => {},
  colorScheme: 'light',
});

export const useTheme = () => useContext(ThemeContext);

const THEME_STORAGE_KEY = 'user_theme_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useNativeColorScheme();
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load persisted theme preference
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemePreferenceState(stored);
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const setThemePreference = async (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, pref);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const colorScheme = useMemo(() => {
    if (themePreference === 'system') {
      return systemColorScheme;
    }
    return themePreference;
  }, [themePreference, systemColorScheme]);

  // Prevent flash of wrong theme by waiting for load (optional, but good for UX)
  // For now we just render, defaulting to system/light, which is fine.

  return (
    <ThemeContext.Provider
      value={{ themePreference, setThemePreference, colorScheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
