import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AccountDetailScreen() {
  const { accountId } = useLocalSearchParams<{ accountId: string }>();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={[styles.safeArea, { backgroundColor: palette.background }]}> 
      <View style={styles.header}>
        <ThemedText type="title">Account</ThemedText>
        <ThemedText style={{ color: palette.icon }}>
          Detailed insights for {accountId?.replace('-', ' ') ?? 'account'}.
        </ThemedText>
      </View>
      <ThemedView style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <ThemedText type="subtitle">Balance Summary</ThemedText>
        <ThemedText style={{ color: palette.icon }}>
          Data sync and advanced analytics coming soon.
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
});
