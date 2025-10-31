import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const [biometrics, setBiometrics] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <ThemedView style={[styles.safeArea, { backgroundColor: palette.background }]}> 
      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}> 
        <ThemedText type="title">Profile & Security</ThemedText>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <ThemedText>Biometric unlock</ThemedText>
            <ThemedText style={{ color: palette.icon }}>Face ID / Touch ID</ThemedText>
          </View>
          <Switch
            value={biometrics}
            onValueChange={setBiometrics}
            trackColor={{ false: palette.border, true: palette.tint }}
            thumbColor={palette.background}
          />
        </View>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <ThemedText>Push notifications</ThemedText>
            <ThemedText style={{ color: palette.icon }}>Spending alerts & reminders</ThemedText>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: palette.border, true: palette.tint }}
            thumbColor={palette.background}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
    marginRight: Spacing.lg,
    gap: Spacing.xs,
  },
});
