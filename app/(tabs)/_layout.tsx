import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { HeaderRight } from '@/components/HeaderRight';
import { MenuButton } from '@/components/MenuButton';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const tabBarStyle = useMemo(
    () => [
      styles.tabBar,
      {
        backgroundColor: palette.card,
        borderColor: palette.border,
        shadowColor: colorScheme === 'dark' ? '#000000' : 'rgba(15,23,42,0.2)',
      },
    ],
    [palette.card, palette.border, colorScheme]
  );

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: palette.tint,
          tabBarInactiveTintColor: palette.icon,
  tabBarStyle,
          tabBarButton: HapticTab,
          tabBarHideOnKeyboard: true,
          headerShown: true,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            headerLeft: () => <MenuButton />,
            headerTitle: '',
            headerRight: () => <HeaderRight />,
          }}
        />
        <Tabs.Screen
          name="accounts"
          options={{
            headerLeft: () => <MenuButton />,
            headerTitle: '',
            headerRight: () => <HeaderRight />,
          }}
        />
        <Tabs.Screen
          name="analysis"
          options={{
            headerLeft: () => <MenuButton />,
            headerTitle: '',
            headerRight: () => <HeaderRight />,
          }}
        />
      </Tabs>

      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 68,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0,
    elevation: 8,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  tabBarItem: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 20,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  tabIcon: {
    marginBottom: 0,
  },
});
