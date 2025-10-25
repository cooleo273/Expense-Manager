import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme, useThemePreference } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const activeBackground = colorScheme === 'dark' ? 'rgba(96,165,250,0.22)' : 'rgba(96,165,250,0.12)';
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
          tabBarActiveBackgroundColor: activeBackground,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIconStyle: styles.tabIcon,
          tabBarItemStyle: styles.tabBarItem,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarHideOnKeyboard: true,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="analysis"
          options={{
            title: 'Analysis',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="accounts"
          options={{
            title: 'Accounts',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="creditcard.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="camera.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: 'More',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="ellipsis" color={color} />,
          }}
        />
      </Tabs>

      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <ThemeToggleControl />
        <GlobalQuickActionsFab />
      </View>
    </View>
  );
}

function ThemeToggleControl() {
  const colorScheme = useColorScheme();
  const { preference, setPreference, togglePreference } = useThemePreference();
  const palette = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const displayLabel = preference === 'system' ? 'Auto' : preference === 'dark' ? 'Dark' : 'Light';
  const iconName = colorScheme === 'dark' ? 'weather-night' : 'weather-sunny';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Toggle theme"
      accessibilityHint="Switch between light and dark modes. Long press to return to system default."
      onPress={togglePreference}
      onLongPress={() => setPreference('system')}
      style={[
        styles.themeToggle,
        {
          top: insets.top + 12,
          right: 24,
          backgroundColor: palette.card,
          borderColor: palette.border,
        },
      ]}
    >
      <MaterialCommunityIcons name={iconName} size={20} color={palette.text} />
      <ThemedText style={styles.themeToggleLabel}>{displayLabel}</ThemedText>
    </TouchableOpacity>
  );
}

function GlobalQuickActionsFab() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const actions = useMemo(
    () => [
      {
        id: 'log-expense',
        label: 'Log expense',
        icon: 'note-edit-outline' as const,
        navigate: () => router.push('/log-expenses'),
      },
      {
        id: 'scan-receipt',
        label: 'Scan receipt',
        icon: 'camera-outline' as const,
        navigate: () => router.push('/(tabs)/scan'),
      },
      {
        id: 'add-reminder',
        label: 'Add reminder',
        icon: 'bell-plus-outline' as const,
        navigate: () => router.push('/reminders'),
      },
      {
        id: 'add-account',
        label: 'Add account',
        icon: 'wallet-plus' as const,
        navigate: () => router.push('/add-account'),
      },
    ],
    [router]
  );

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {expanded && <Pressable style={StyleSheet.absoluteFill} onPress={() => setExpanded(false)} />}
      <View
        pointerEvents="box-none"
        style={[
          styles.fabWrapper,
          {
            bottom: insets.bottom + 110,
            right: 24,
          },
        ]}
      >
        {expanded && (
          <View style={[styles.actionList, { backgroundColor: palette.card, borderColor: palette.border }]}> 
            {actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionButton}
                activeOpacity={0.85}
                onPress={() => {
                  setExpanded(false);
                  action.navigate();
                }}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                <MaterialCommunityIcons name={action.icon} size={20} color={palette.tint} />
                <ThemedText style={{ color: palette.text }}>{action.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Close quick actions' : 'Open quick actions'}
          activeOpacity={0.85}
          onPress={() => setExpanded((prev) => !prev)}
          style={[styles.fab, { backgroundColor: palette.tint, shadowColor: palette.text }]}
        >
          <MaterialCommunityIcons
            name={expanded ? 'close' : 'plus'}
            size={28}
            color={palette.background}
          />
        </TouchableOpacity>
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
    left: 16,
    right: 16,
    bottom: 16,
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
  themeToggle: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  themeToggleLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  fabWrapper: {
    position: 'absolute',
    alignItems: 'flex-end',
    gap: 12,
  },
  actionList: {
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
