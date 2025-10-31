import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { tabLayoutStyles } from '@/app/styles/tab-layout.styles';
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
          tabBarHideOnKeyboard: true,
          headerShown: true,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" color={color} size={size} />,
            headerLeft: () => <MenuButton />,
            headerTitle: '',
            headerRight: () => <HeaderRight />,
          }}
        />
        <Tabs.Screen
          name="records"
          options={{
            title: 'Records',
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="receipt" color={color} size={size} />,
            headerLeft: () => <MenuButton />,
            headerTitle: '',
            headerRight: () => <HeaderRight />,
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            title: 'Statistics',
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-bar" color={color} size={size} />,
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

const styles = tabLayoutStyles;
