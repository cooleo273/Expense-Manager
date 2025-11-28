import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { FilterProvider } from '@/contexts/FilterContext';
import { ThemeProvider as AppThemeProvider, useThemeContext } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <ToastProvider>
        <FilterProvider>
          <RootLayoutContent />
        </FilterProvider>
      </ToastProvider>
    </AppThemeProvider>
  );
}

function RootLayoutContent() {
  const { colorScheme } = useThemeContext();
  const palette = Colors[colorScheme];

  const paperTheme = useMemo(() => {
    const baseTheme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: palette.tint,
        secondary: palette.accent,
        background: palette.background,
        surface: palette.card,
        onSurface: palette.text,
        onPrimary: '#FFFFFF',
      },
    };
  }, [colorScheme, palette]);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PaperProvider theme={paperTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="scan" options={{ headerShown: false, headerLeft: () => null, headerTitle: '' }} />
            <Stack.Screen name="legacy" options={{ headerShown: false, headerLeft: () => null, headerTitle: '' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="Category" options={{ animation: 'none' }} />
            <Stack.Screen name="subcategories" options={{ animation: 'none' }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </PaperProvider>
    </NavigationThemeProvider>
  );
}
