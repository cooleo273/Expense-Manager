import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { CartProvider } from '@/contexts/CartContext';
import { FilterProvider } from '@/contexts/FilterContext';
import { ThemeProvider as AppThemeProvider, useThemeContext } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <ToastProvider>
      <AppThemeProvider>
        <FilterProvider>
          <RootLayoutContent />
        </FilterProvider>
      </AppThemeProvider>
    </ToastProvider>
  );
}

function RootLayoutContent() {
  const { colorScheme } = useThemeContext();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <CartProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </CartProvider>
    </NavigationThemeProvider>
  );
}
