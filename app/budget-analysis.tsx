import React from 'react';
import { ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { budgetAnalysisStyles } from '@/styles/budget-analysis.styles';
import { mockBudgetCategories } from '../constants/mock-data';

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

        {mockBudgetCategories.map((category) => {
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

const styles = budgetAnalysisStyles;
