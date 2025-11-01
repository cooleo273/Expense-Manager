import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { TransactionTypeFilter, TransactionTypeValue } from '@/components/TransactionTypeFilter';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { recordsStyles } from '@/styles/records.styles';

const transactions = [
  {
    id: 'rent',
    title: 'Rent',
    account: 'RBC Credit Card',
    note: "October's fee · Mr. L Lord",
    amount: -780,
    dateLabel: 'Yesterday',
    type: 'expense',
    icon: 'home-city-outline',
  },
  {
    id: 'salary',
    title: 'Salary',
    account: 'RBC Account',
    note: "September's · Company X",
    amount: 4500,
    dateLabel: 'Oct 18',
    type: 'income',
    icon: 'briefcase-outline',
  },
  {
    id: 'fuel',
    title: 'Fuel',
    account: 'RBC Credit Card',
    note: 'Gas · Mobil',
    amount: -18.52,
    dateLabel: 'Oct 18',
    type: 'expense',
    icon: 'gas-station-outline',
  },
  {
    id: 'groceries',
    title: 'Groceries (10)',
    account: 'RBC Credit Card',
    note: 'Milk (9) · Walmart',
    amount: -50.7,
    dateLabel: 'Oct 16',
    type: 'expense',
    icon: 'cart-outline',
  },
  {
    id: 'stationary',
    title: 'Stationary',
    account: 'RBC Credit Card',
    note: 'Notebooks · Staples',
    amount: -4.7,
    dateLabel: 'Oct 14',
    type: 'expense',
    icon: 'pencil-outline',
  },
];

const filterSections = [
  {
    id: 'recordType',
    title: 'Record Type',
    detail: undefined,
    chips: ['Expense', 'Income', 'All'],
  },
  {
    id: 'categories',
    title: 'Categories (7)',
    detail: 'Fuel, Groceries, Household…',
  },
  {
    id: 'payers',
    title: 'Payers, Payees',
    detail: '—',
  },
  {
    id: 'labels',
    title: 'Labels (2)',
    detail: 'Sale, Bargain',
  },
  {
    id: 'keyTerms',
    title: 'Key Terms (3)',
    detail: 'Black, Gift, Mom',
  },
  {
    id: 'amount',
    title: 'Amount',
    detail: '$5.00 - $75',
  },
  {
    id: 'accounts',
    title: 'Accounts (All)',
    detail: undefined,
  },
  {
    id: 'timePeriod',
    title: 'Time Period',
    detail: 'This Week',
  },
];

export default function RecordsScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const accent = palette.tint;

  const [selectedRecordType, setSelectedRecordType] = useState<TransactionTypeValue>('all');
  const [sortAscending, setSortAscending] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedData = useMemo(() => {
    const filtered = transactions.filter((item) => {
      if (selectedRecordType === 'all') return true;
      return selectedRecordType === item.type;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortAscending) {
        return a.amount - b.amount;
      }
      return b.amount - a.amount;
    });

    return sorted;
  }, [selectedRecordType, sortAscending]);

  const formatCurrency = (value: number) => {
    const abs = Math.abs(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${value >= 0 ? '+' : '-'}$${abs}`;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <FlatList
        contentContainerStyle={[styles.content, { backgroundColor: palette.background }]}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <ThemedText style={[styles.headerTitle, { color: palette.text }]}>All Accounts</ThemedText>
              <TouchableOpacity style={[styles.headerButton, { borderColor: palette.border }]}>
                <MaterialCommunityIcons name="calendar-month" size={20} color={palette.tint} />
              </TouchableOpacity>
            </View>
            <View style={styles.filterRow}>
              <TransactionTypeFilter
                value={selectedRecordType}
                onChange={setSelectedRecordType}
                options={['expense', 'income', 'all']}
                style={styles.chipRow}
              />
              <View style={styles.actionIcons}>
                <TouchableOpacity
                  style={[styles.actionIcon, { borderColor: palette.border }]}
                  onPress={() => setShowFilters(true)}
                >
                  <MaterialCommunityIcons name="tune-variant" size={18} color={palette.icon} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionIcon, { borderColor: palette.border }]}
                  onPress={() => setSortAscending((prev) => !prev)}
                >
                  <MaterialCommunityIcons
                    name="swap-vertical"
                    size={18}
                    color={sortAscending ? accent : palette.icon}
                    style={sortAscending ? styles.sortIconRotated : undefined}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        data={filteredAndSortedData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: `${item.type === 'income' ? palette.success : palette.tint}15`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={20}
                color={item.type === 'income' ? palette.success : palette.tint}
              />
            </View>
            <View style={styles.itemContent}>
              <ThemedText style={[styles.itemTitle, { color: palette.text }]}>{item.title}</ThemedText>
              <ThemedText style={[styles.itemSubtitle, { color: palette.icon }]}>{item.account}</ThemedText>
              <ThemedText style={[styles.itemNote, { color: palette.icon }]}>{item.note}</ThemedText>
            </View>
            <View style={styles.itemMeta}>
              <ThemedText
                style={[
                  styles.itemAmount,
                  { color: item.amount >= 0 ? palette.success : palette.error },
                ]}
              >
                {formatCurrency(item.amount)}
              </ThemedText>
              <ThemedText style={[styles.itemDate, { color: palette.icon }]}>{item.dateLabel}</ThemedText>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: palette.border }]} />}
        ListFooterComponent={<View style={{ height: 40 }} />}
      />

      <Modal transparent visible={showFilters} animationType="fade" onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowFilters(false)} />
          <View style={[styles.filterSheet, { backgroundColor: palette.card, borderColor: palette.border }]}> 
            <View style={styles.filterHeader}>
              <ThemedText style={[styles.filterTitle, { color: palette.text }]}>Filters</ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setSelectedRecordType('all');
                  setSortAscending(false);
                }}
              >
                <ThemedText style={{ color: accent, fontWeight: '600' }}>Reset</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.filterContent}>
              {filterSections.map((section) => (
                <View key={section.id} style={[styles.filterRowItem, { borderColor: palette.border }]}> 
                  <View style={styles.filterRowText}>
                    <ThemedText style={[styles.filterRowTitle, { color: palette.text }]}>{section.title}</ThemedText>
                    {section.detail && (
                      <ThemedText style={{ color: palette.icon, marginTop: 4 }}>{section.detail}</ThemedText>
                    )}
                    {section.chips && (
                      <View style={styles.filterChipRow}>
                        {section.chips.map((chip) => {
                          const isActive = selectedRecordType === chip.toLowerCase();
                          return (
                            <TouchableOpacity
                              key={chip}
                              style={[
                                styles.modalChip,
                                isActive
                                  ? { backgroundColor: `${accent}15`, borderColor: accent }
                                  : { borderColor: palette.border },
                              ]}
                              onPress={() => setSelectedRecordType(chip.toLowerCase() as 'all' | 'income' | 'expense')}
                            >
                              <ThemedText
                                style={[
                                  styles.modalChipLabel,
                                  { color: isActive ? accent : palette.icon },
                                ]}
                              >
                                {chip.toUpperCase()}
                              </ThemedText>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                  <MaterialCommunityIcons name="chevron-down" size={22} color={palette.icon} />
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: accent }]}
              onPress={() => setShowFilters(false)}
            >
              <ThemedText style={{ color: 'white', fontWeight: '700' }}>APPLY</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = recordsStyles;