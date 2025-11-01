import React, { createContext, useContext, useMemo, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedScheme = 'light' | 'dark';

type ThemeContextValue = {
  colorScheme: ResolvedScheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  togglePreference: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('light');
  const colorScheme: ResolvedScheme = 'light';

  const setPreference = (next: ThemePreference) => {
    // Lock the experience to light mode while preserving the existing API surface.
    setPreferenceState('light');
  };

  const togglePreference = () => {
    setPreferenceState('light');
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
