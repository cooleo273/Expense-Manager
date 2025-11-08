import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { TransactionTypeFilter, TransactionTypeValue } from '@/components/TransactionTypeFilter';
import { getCategoryColor, getCategoryIcon, getNodeDisplayName, isSubcategoryId } from '@/constants/categories';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { recordsStyles } from '@/styles/records.styles';
import { mockRecordsData } from '../../constants/mock-data';
import { DateRange, useFilterContext } from '../../contexts/FilterContext';
import { StorageService } from '../../services/storage';

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date-desc', label: 'Date (desc)' },
  { value: 'date-asc', label: 'Date (asc)' },
  { value: 'amount-desc', label: 'Amount (desc)' },
  { value: 'amount-asc', label: 'Amount (asc)' },
];

type DraftRange = {
  start: Date;
  end?: Date;
};

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const getMonthMatrix = (cursor: Date) => {
  const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const firstDayOfWeek = (firstOfMonth.getDay() + 6) % 7; // start week on Monday
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - firstDayOfWeek);

  const weeks: Date[][] = [];
  for (let week = 0; week < 6; week++) {
    const days: Date[] = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + week * 7 + day);
      days.push(date);
    }
    weeks.push(days);
  }
  return weeks;
};

const formatMonthTitle = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function RecordsScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const accent = palette.tint;
  const router = useRouter();
  const { filters, setSelectedCategories, setDateRange } = useFilterContext();

  const [selectedRecordType, setSelectedRecordType] = useState<TransactionTypeValue>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [monthCursor, setMonthCursor] = useState(startOfDay(new Date()));
  const [draftRange, setDraftRange] = useState<DraftRange | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  const loadTransactions = useCallback(async () => {
    try {
      const data = await StorageService.getTransactions();
      // Use mock data if no real data exists
      const transactionsToUse = data.length > 0 ? data : mockRecordsData;
      // Transform data to match UI expectations
      const transformedData = transactionsToUse.map(transaction => ({
        ...transaction,
        date: new Date(transaction.date), // Convert string to Date
        dateLabel: new Date(transaction.date).toLocaleDateString(), // Add dateLabel
        subtitle: `${transaction.categoryId}${transaction.subcategoryId ? ` - ${transaction.subcategoryId}` : ''}`, // Add subtitle
      }));
      setTransactions(transformedData);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      // Fallback to mock data on error
      const transformedData = mockRecordsData.map(transaction => ({
        ...transaction,
        date: new Date(transaction.date), // Convert string to Date
        dateLabel: new Date(transaction.date).toLocaleDateString(), // Add dateLabel
        subtitle: `${transaction.categoryId}${transaction.subcategoryId ? ` - ${transaction.subcategoryId}` : ''}`, // Add subtitle
      }));
      setTransactions(transformedData);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  const filteredAndSortedData = useMemo(() => {
    const filtered = transactions.filter((item) => {
      if (selectedRecordType !== 'all' && selectedRecordType !== item.type) {
        return false;
      }

      if (filters.selectedCategories.length > 0) {
        const matchesCategory = filters.selectedCategories.some(selectedId => {
          if (isSubcategoryId(selectedId)) {
            return item.subcategoryId === selectedId;
          }
          return item.categoryId === selectedId;
        });
        if (!matchesCategory) {
          return false;
        }
      }

      if (filters.dateRange) {
        const itemDate = item.date;
        if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          // Sort by date descending
          return b.date.getTime() - a.date.getTime();
        case 'date-asc':
          // Sort by date ascending
          return a.date.getTime() - b.date.getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return sorted;
  }, [selectedRecordType, sortOption, filters.selectedCategories, filters.dateRange, transactions]);

  const monthMatrix = useMemo(() => getMonthMatrix(monthCursor), [monthCursor]);

  const isWithinDraftRange = (date: Date) => {
    if (!draftRange) {
      return false;
    }

    if (draftRange.start && draftRange.end) {
      const start = draftRange.start < draftRange.end ? draftRange.start : draftRange.end;
      const end = draftRange.start < draftRange.end ? draftRange.end : draftRange.start;
      return date >= start && date <= end;
    }

    return draftRange.start && isSameDay(draftRange.start, date);
  };

  const handleDayPress = (date: Date) => {
    const normalized = startOfDay(date);
    setDraftRange(prev => {
      if (!prev || (prev.start && prev.end)) {
        return { start: normalized };
      }

      if (prev.start && !prev.end) {
        return { start: prev.start, end: normalized };
      }

      return { start: normalized };
    });
  };

  const applyRange = (range: DateRange | null) => {
    setDateRange(range);
    setShowCalendarModal(false);
  };

  const handleConfirm = () => {
    if (!draftRange) {
      applyRange(null);
      return;
    }

    const { start, end } = draftRange;
    if (start && end) {
      const orderedStart = start < end ? start : end;
      const orderedEnd = start < end ? end : start;
      applyRange({ start: orderedStart, end: orderedEnd });
    } else if (start) {
      applyRange({ start, end: start });
    }
  };

  const quickSelect = (option: 'all' | 'week' | 'month') => {
    const now = new Date();
    if (option === 'all') {
      applyRange(null);
      return;
    }

    if (option === 'week') {
      const start = startOfDay(now);
      const weekday = (start.getDay() + 6) % 7;
      start.setDate(start.getDate() - weekday);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      applyRange({ start, end });
      return;
    }

    if (option === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      applyRange({ start: startOfDay(start), end: startOfDay(end) });
    }
  };

  useEffect(() => {
    if (showCalendarModal) {
      if (filters.dateRange) {
        setDraftRange({ start: startOfDay(filters.dateRange.start), end: startOfDay(filters.dateRange.end) });
        setMonthCursor(startOfDay(filters.dateRange.start));
      } else {
        setDraftRange(null);
        setMonthCursor(startOfDay(new Date()));
      }
    }
  }, [showCalendarModal, filters.dateRange]);

  const formatCurrency = (value: number) => {
    const abs = Math.abs(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${value >= 0 ? '+' : '-'}$${abs}`;
  };

  const selectedCategoryLabels = filters.selectedCategories
    .map(id => getNodeDisplayName(id))
    .filter((name): name is string => Boolean(name));

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
      detail: selectedCategoryLabels.length > 0 
        ? `${selectedCategoryLabels.slice(0, 3).join(', ')}${selectedCategoryLabels.length > 3 ? '...' : ''}`
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
      detail: filters.dateRange 
        ? `${filters.dateRange.start.toLocaleDateString()} - ${filters.dateRange.end.toLocaleDateString()}`
        : 'All Time',
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
                  backgroundColor: `${getCategoryColor(item.categoryId, palette.tint)}15`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={getCategoryIcon(item.categoryId, item.type === 'income' ? 'wallet-plus' : 'shape-outline')}
                size={20}
                color={getCategoryColor(item.categoryId, palette.tint)}
              />
            </View>
            <View style={styles.itemContent}>
              <ThemedText style={[styles.itemTitle, { color: palette.text }]}>{item.title}</ThemedText>
              <ThemedText style={[styles.itemSubtitle, { color: palette.icon }]}>{item.subtitle}</ThemedText>
              <ThemedText style={[styles.itemNote, { color: palette.icon }]}></ThemedText>
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
                  ) : section.id === 'timePeriod' ? (
                    <TouchableOpacity onPress={() => setShowCalendarModal(true)}>
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

      <Modal transparent visible={showCalendarModal} animationType="fade" onRequestClose={() => setShowCalendarModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowCalendarModal(false)} />
          <View style={[styles.calendarSheet, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={palette.icon} />
              </TouchableOpacity>
              <ThemedText style={[styles.calendarTitle, { color: palette.text }]}>Select Date Range</ThemedText>
              <TouchableOpacity onPress={handleConfirm}>
                <ThemedText style={{ color: accent, fontWeight: '600' }}>DONE</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.quickSelectRow}>
              <TouchableOpacity style={styles.quickSelectButton} onPress={() => quickSelect('all')}>
                <ThemedText style={[styles.quickSelectText, { color: palette.icon }]}>All Time</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickSelectButton} onPress={() => quickSelect('week')}>
                <ThemedText style={[styles.quickSelectText, { color: palette.icon }]}>This Week</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickSelectButton} onPress={() => quickSelect('month')}>
                <ThemedText style={[styles.quickSelectText, { color: palette.icon }]}>This Month</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={() => setMonthCursor(prev => addMonths(prev, -1))}>
                <MaterialCommunityIcons name="chevron-left" size={24} color={palette.icon} />
              </TouchableOpacity>
              <ThemedText style={[styles.monthTitle, { color: palette.text }]}>
                {formatMonthTitle(monthCursor)}
              </ThemedText>
              <TouchableOpacity onPress={() => setMonthCursor(prev => addMonths(prev, 1))}>
                <MaterialCommunityIcons name="chevron-right" size={24} color={palette.icon} />
              </TouchableOpacity>
            </View>
            <View style={styles.weekDayHeader}>
              {weekDayLabels.map((day) => (
                <ThemedText key={day} style={[styles.weekDayLabel, { color: palette.icon }]}>
                  {day}
                </ThemedText>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {monthMatrix.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.weekRow}>
                  {week.map((date, dayIndex) => {
                    const isCurrentMonth = date.getMonth() === monthCursor.getMonth();
                    const isSelected = isWithinDraftRange(date);
                    const isToday = isSameDay(date, new Date());
                    return (
                      <TouchableOpacity
                        key={dayIndex}
                        style={[
                          styles.dayCell,
                          isSelected && { backgroundColor: `${accent}20` },
                          isToday && { borderColor: accent, borderWidth: 1 },
                        ]}
                        onPress={() => handleDayPress(date)}
                      >
                        <ThemedText
                          style={[
                            styles.dayText,
                            {
                              color: isCurrentMonth ? palette.text : palette.icon,
                              fontWeight: isSelected ? '600' : '400',
                            },
                          ]}
                        >
                          {date.getDate()}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = recordsStyles;