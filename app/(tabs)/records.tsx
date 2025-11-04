import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { TransactionTypeFilter, TransactionTypeValue } from '@/components/TransactionTypeFilter';
import { getCategoryDefinition } from '@/constants/categories';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { recordsStyles } from '@/styles/records.styles';
import { mockTransactions } from '../mock-data';

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date-desc', label: 'Date (desc)' },
  { value: 'date-asc', label: 'Date (asc)' },
  { value: 'amount-desc', label: 'Amount (desc)' },
  { value: 'amount-asc', label: 'Amount (asc)' },
];

export default function RecordsScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const accent = palette.tint;
  const router = useRouter();
  const { filters, setSelectedCategories } = useFilterContext();

  const [selectedRecordType, setSelectedRecordType] = useState<TransactionTypeValue>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const filteredAndSortedData = useMemo(() => {
    const filtered = mockTransactions.filter((item) => {
      if (selectedRecordType === 'all') return true;
      return selectedRecordType === item.type;
    }).filter((item) => {
      if (filters.selectedCategories.length === 0) return true;
      return filters.selectedCategories.includes(item.categoryId);
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          // Sort by original order (assuming data is already in date desc order)
          return mockTransactions.indexOf(a) - mockTransactions.indexOf(b);
        case 'date-asc':
          // Reverse order for ascending
          return mockTransactions.indexOf(b) - mockTransactions.indexOf(a);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return sorted;
  }, [selectedRecordType, sortOption, filters.selectedCategories]);

  const formatCurrency = (value: number) => {
    const abs = Math.abs(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${value >= 0 ? '+' : '-'}$${abs}`;
  };

  const filterSections = [
    {
      id: 'recordType',
      title: 'Record Type',
      detail: undefined,
      chips: ['Expense', 'Income', 'All'],
    },
    {
      id: 'categories',
      title: `Categories (${filters.selectedCategories.length || 'All'})`,
      detail: filters.selectedCategories.length > 0 
        ? filters.selectedCategories.map(id => getCategoryDefinition(id)?.name).slice(0, 3).join(', ') + (filters.selectedCategories.length > 3 ? '...' : '')
        : 'Fuel, Groceries, Household…',
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={{ flex: 1, overflow: 'visible' }}>
        <FlatList
          contentContainerStyle={[styles.content, { backgroundColor: palette.background }]}
          ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.filterRow}>
              <TransactionTypeFilter
                value={selectedRecordType}
                onChange={setSelectedRecordType}
                options={['expense', 'income', 'all']}
                style={styles.chipRow}
                variant="compact"
              />
              <View style={styles.actionIcons}>
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity
                    style={[styles.actionIcon, { borderColor: palette.border }]}
                    onPress={() => setShowFilters(true)}
                  >
                    <MaterialCommunityIcons name="tune-variant" size={18} color={palette.icon} />
                  </TouchableOpacity>
                  <ThemedText style={{ fontSize: FontSizes.xs, color: palette.icon, marginTop: 2 }}>
                    {selectedRecordType.toUpperCase()}
                  </ThemedText>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <View style={styles.sortContainer}>
                    <TouchableOpacity
                      style={[styles.actionIcon, { borderColor: palette.border }]}
                      onPress={() => setShowSortDropdown(!showSortDropdown)}
                    >
                      <MaterialCommunityIcons name="swap-vertical" size={18} color={palette.icon} />
                    </TouchableOpacity>
                  </View>
                  <ThemedText style={{ fontSize: FontSizes.xs, color: palette.icon, marginTop: 2 }}>
                    {SORT_OPTIONS.find(o => o.value === sortOption)?.label}
                  </ThemedText>
                </View>
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
      </View>

      <Modal transparent visible={showSortDropdown} animationType="none" onRequestClose={() => setShowSortDropdown(false)}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowSortDropdown(false)} />
        <View style={[styles.sortDropdown, { backgroundColor: '#ffffff', borderColor: palette.border, position: 'absolute', top: 100, right: 20 }]}>
          <View style={styles.sortHeader}>
            <ThemedText style={[styles.sortTitle, { color: palette.text }]}>Sort by</ThemedText>
            <TouchableOpacity onPress={() => setShowSortDropdown(false)}>
              <MaterialCommunityIcons name="close" size={20} color={palette.icon} />
            </TouchableOpacity>
          </View>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.sortOption}
              onPress={() => {
                setSortOption(option.value);
                setShowSortDropdown(false);
              }}
            >
              <ThemedText
                style={[
                  styles.sortOptionText,
                  {
                    color: sortOption === option.value ? accent : palette.text,
                    fontWeight: sortOption === option.value ? '600' : '400',
                  },
                ]}
              >
                {option.label}
              </ThemedText>
              {sortOption === option.value && (
                <MaterialCommunityIcons name="check" size={20} color={accent} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      <Modal transparent visible={showFilters} animationType="fade" onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowFilters(false)} />
          <View style={[styles.filterSheet, { backgroundColor: palette.card, borderColor: palette.border }]}> 
            <View style={styles.filterHeader}>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <MaterialCommunityIcons name="close" size={24} color={palette.icon} />
              </TouchableOpacity>
              <ThemedText style={[styles.filterTitle, { color: palette.text }]}>Filters</ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setSelectedRecordType('all');
                  setSortOption('date-desc');
                }}
              >
                <ThemedText style={{ color: accent, fontWeight: '600' }}>RESET</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.filterContent}>
              {filterSections.map((section) => (
                <View key={section.id}>
                  {section.id === 'categories' ? (
                    <TouchableOpacity onPress={() => router.push('/categories?from=filter')}>
                      <View style={[styles.filterRowItem]}> 
                        <View style={styles.filterRowText}>
                          <ThemedText style={[styles.filterRowTitle, { color: palette.text }]}>{section.title}</ThemedText>
                          {section.detail && (
                            <ThemedText style={{ color: palette.icon, marginTop: 4 }}>{section.detail}</ThemedText>
                          )}
                        </View>
                        <MaterialCommunityIcons name="chevron-down" size={22} color={palette.icon} />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.filterRowItem]}> 
                      <View style={styles.filterRowText}>
                        <ThemedText style={[styles.filterRowTitle, { color: palette.text }]}>{section.title}</ThemedText>
                        {section.detail && (
                          <ThemedText style={{ color: palette.icon, marginTop: 4 }}>{section.detail}</ThemedText>
                        )}
                        {section.chips && section.id === 'recordType' && (
                          <TransactionTypeFilter
                            value={selectedRecordType}
                            onChange={setSelectedRecordType}
                            options={['expense', 'income', 'all']}
                            variant="compact"
                            style={{ marginTop: Spacing.sm }}
                          />
                        )}
                        {section.chips && section.id !== 'recordType' && (
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
                      {section.id !== 'recordType' && <MaterialCommunityIcons name="chevron-down" size={22} color={palette.icon} />}
                    </View>
                  )}
                  <View style={[styles.separator, { backgroundColor: palette.border }]} />
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