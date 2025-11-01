import React from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SupportScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={[styles.safeArea, { backgroundColor: palette.background }]}> 
      <View style={styles.header}>
        <ThemedText type="title">Help Center</ThemedText>
        <ThemedText style={{ color: palette.icon }}>
          Find quick answers, guides, and contact support.
        </ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}> 
        <ThemedText type="subtitle">Contact Us</ThemedText>
        <TouchableOpacity onPress={() => Linking.openURL('mailto:support@splashfinance.app')}>
          <ThemedText style={{ color: palette.tint }}>support@splashfinance.app</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('tel:+18005551234')}>
          <ThemedText style={{ color: palette.tint }}>+1 (800) 555-1234</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  header: {
    gap: Spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
});
