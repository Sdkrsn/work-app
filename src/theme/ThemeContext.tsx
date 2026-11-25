import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mode, Scheme, palettes, Palette } from './colors';

interface ThemeContextValue {
  mode: Mode;
  scheme: Scheme;
  colors: Palette;
  setMode: (m: Mode) => void;
  toggleScheme: () => void;
  setScheme: (s: Scheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const MODE_KEY = 'workos.mode';
const SCHEME_KEY = 'workos.scheme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<Mode>('work');
  const [scheme, setSchemeState] = useState<Scheme>(systemScheme === 'dark' ? 'dark' : 'light');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [savedMode, savedScheme] = await Promise.all([
        AsyncStorage.getItem(MODE_KEY),
        AsyncStorage.getItem(SCHEME_KEY),
      ]);
      if (savedMode === 'work' || savedMode === 'personal') setModeState(savedMode);
      if (savedScheme === 'light' || savedScheme === 'dark') setSchemeState(savedScheme);
      setLoaded(true);
    })();
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    AsyncStorage.setItem(MODE_KEY, m);
  };

  const setScheme = (s: Scheme) => {
    setSchemeState(s);
    AsyncStorage.setItem(SCHEME_KEY, s);
  };

  const toggleScheme = () => setScheme(scheme === 'dark' ? 'light' : 'dark');

  const colors = useMemo(() => palettes[mode][scheme], [mode, scheme]);

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ mode, scheme, colors, setMode, toggleScheme, setScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
