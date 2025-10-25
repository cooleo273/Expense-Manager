import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const transactions = [
  { id: 't1', title: 'Amazon', subtitle: 'Shopping', amount: -1050, date: '07 Feb 2024' },
  { id: 't2', title: 'Salary', subtitle: 'Income', amount: 50000, date: '05 Feb 2024' },
  { id: 't3', title: 'Groceries', subtitle: 'Food & Drinks', amount: -890, date: '02 Feb 2024' },
  { id: 't4', title: 'Mutual Fund', subtitle: 'Investments', amount: -2500, date: '31 Jan 2024' },
];

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
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThemedView style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}> 
            <View style={styles.rowText}>
              <ThemedText type="subtitle">{item.title}</ThemedText>
              <ThemedText style={{ color: palette.icon }}>{item.subtitle}</ThemedText>
              <ThemedText style={{ color: palette.icon, marginTop: 2 }}>{item.date}</ThemedText>
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
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  header: {
    gap: 8,
    marginBottom: 8,
  },
  row: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
});
