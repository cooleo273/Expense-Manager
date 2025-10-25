import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';

export type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedScheme = 'light' | 'dark';

type ThemeContextValue = {
  colorScheme: ResolvedScheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  togglePreference: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const systemColorScheme = (): ResolvedScheme => (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [systemScheme, setSystemScheme] = useState<ResolvedScheme>(systemColorScheme());

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        setSystemScheme(colorScheme === 'dark' ? 'dark' : 'light');
      }
    });

    return () => subscription.remove();
  }, []);

  const colorScheme: ResolvedScheme = preference === 'system' ? systemScheme : preference;

  const togglePreference = () => {
    setPreference(prev => {
      const current = prev === 'system' ? systemScheme : prev;
      return current === 'dark' ? 'light' : 'dark';
    });
  };

  const value = useMemo(
    () => ({ colorScheme, preference, setPreference, togglePreference }),
    [colorScheme, preference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
