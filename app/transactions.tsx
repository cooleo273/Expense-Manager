import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { mockTransactionsList } from './mock-data';

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <FlatList
        contentContainerStyle={[styles.content, { backgroundColor: palette.background }]}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="title">All Transactions</ThemedText>
            <ThemedText style={{ color: palette.icon }}>Review spending and income history.</ThemedText>
          </View>
        }
        data={mockTransactionsList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThemedView style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}> 
            <View style={styles.rowText}>
              <ThemedText type="subtitle">{item.title}</ThemedText>
              <ThemedText style={{ color: palette.icon }}>{item.subtitle}</ThemedText>
              <ThemedText style={{ color: palette.icon, marginTop: Spacing.xs }}>{item.date}</ThemedText>
            </View>
            <ThemedText style={{ color: item.amount >= 0 ? palette.success : palette.error }}>
              {`${item.amount >= 0 ? '+' : '-'}₹${Math.abs(item.amount).toLocaleString()}`}
            </ThemedText>
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  header: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  row: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  rowText: {
    flex: 1,
    gap: Spacing.xs,
  },
});
