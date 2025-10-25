import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const budgetCategories = [
  { id: 'shopping', label: 'Shopping', spent: 7000, limit: 20000 },
  { id: 'groceries', label: 'Groceries', spent: 5200, limit: 12000 },
  { id: 'entertainment', label: 'Entertainment', spent: 1800, limit: 6000 },
  { id: 'subscriptions', label: 'Subscriptions', spent: 1400, limit: 3000 },
];

export default function BudgetAnalysisScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: palette.background }]}>
        <View style={styles.header}>
          <ThemedText type="title">Budget Analysis</ThemedText>
          <ThemedText style={{ color: palette.icon }}>
            Track monthly limits and proactive warnings.
          </ThemedText>
        </View>

        {budgetCategories.map((category) => {
          const remaining = category.limit - category.spent;
          const progress = Math.min(category.spent / category.limit, 1);
          const isRisky = progress > 0.75;
          return (
            <ThemedView
              key={category.id}
              style={[styles.card, { borderColor: palette.border, backgroundColor: palette.card }]}
            >
              <ThemedText type="subtitle">{category.label}</ThemedText>
              <View style={styles.row}>
                <ThemedText style={{ color: palette.icon }}>Budget</ThemedText>
                <ThemedText>₹{category.limit.toLocaleString()}</ThemedText>
              </View>
              <View style={styles.row}>
                <ThemedText style={{ color: palette.icon }}>Spent</ThemedText>
                <ThemedText style={{ color: isRisky ? palette.warning : palette.text }}>
                  ₹{category.spent.toLocaleString()}
                </ThemedText>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress * 100}%`, backgroundColor: isRisky ? palette.warning : palette.tint },
                  ]}
                />
              </View>
              <ThemedText style={{ color: palette.icon }}>
                {remaining >= 0
                  ? `You are ₹${remaining.toLocaleString()} under budget`
                  : `Exceeded by ₹${Math.abs(remaining).toLocaleString()}`}
              </ThemedText>
            </ThemedView>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(148,163,184,0.25)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
});
