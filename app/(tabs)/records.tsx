import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import type { FABGroupProps } from 'react-native-paper';
import { FAB, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
// imports consolidated below
import { TransactionTypeFilter, TransactionTypeValue } from '@/components/TransactionTypeFilter';
import { getCategoryColor, getCategoryIcon, getNodeDisplayName, isSubcategoryId } from '@/constants/categories';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Transaction } from '@/services/storage';
import { recordsStyles } from '@/styles/records.styles';
import { formatFriendlyDate, isSameDay, startOfDay } from '@/utils/date';
import { getAccountMeta, mockAccounts, mockRecordsData, resolveAccountId } from '../../constants/mock-data';
import { DateRange, useFilterContext } from '../../contexts/FilterContext';
// @ts-ignore - optional dependency, install with `npm install @react-native-community/slider`
// prefer a dual-handle slider; if the dependency isn't installed fallback to two single sliders
// dynamic require so app stays resilient if the package isn't installed
// @ts-ignore
let MultiSlider: any;
try {
  // @ts-ignore
  MultiSlider = require('@ptomasroos/react-native-multi-slider');
  // the package sometimes exports default
  if (MultiSlider && MultiSlider.default) MultiSlider = MultiSlider.default;
} catch (err) {
  MultiSlider = undefined;
}
// @ts-ignore
import KeyTermsEditor from '@/components/KeyTermsEditor';
import Slider from '@react-native-community/slider';
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

const matchesLabelsSearch = (labels: string[] | string | undefined, search: string) => {
  if (!labels) {
    return false;
  }
  if (Array.isArray(labels)) {
    return labels.some((label) => label.toLowerCase().includes(search));
  }
  return labels.toLowerCase().includes(search);
};

export default function RecordsScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const tabBarHeight = useBottomTabBarHeight();
  const accent = palette.tint;
  const router = useRouter();
  const { filters, setSelectedCategories, setDateRange, setAmountRange, setSelectedPayers, setSelectedLabels, setKeyTerms, setSelectedAccount, resetFilters } = useFilterContext();

  const [selectedRecordType, setSelectedRecordType] = useState<TransactionTypeValue>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'presets' | 'custom'>('presets');
  const [monthCursor, setMonthCursor] = useState(startOfDay(new Date()));
  const [draftRange, setDraftRange] = useState<DraftRange | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [fabOpen, setFabOpen] = useState(false);
  const isFocused = useIsFocused();

  const handleFabNavigate = useCallback(
    (path: Parameters<typeof router.push>[0]) => {
      setFabOpen(false);
      router.push(path as Parameters<typeof router.push>[0]);
    },
    [router]
  );

  const fabActions = useMemo<FABGroupProps['actions']>(
    () => [
      {
        icon: 'camera',
        label: 'Scan Receipt',
        labelTextColor: '#FFFFFF',
        color: palette.accent,
        style: { backgroundColor: palette.card, borderRadius: 28 },
        onPress: () => handleFabNavigate('/scan'),
        small: true,
      },
      {
        icon: 'plus',
        label: 'Add Record',
        labelTextColor: '#FFFFFF',
        color: '#FFFFFF',
        style: { backgroundColor: palette.tint, transform: [{ scale: 1.1 }], borderRadius: 28 },
        onPress: () => handleFabNavigate('/log-expenses'),
        small: false,
      },
    ],
    [handleFabNavigate, palette]
  );

  const loadTransactions = useCallback(async () => {
    try {
      const data = await StorageService.getTransactions();
      const transactionsToUse = data.length > 0 ? data : mockRecordsData;
      type UiTransaction = Transaction & { subtitle?: string; date: Date; dateLabel?: string };
      const transformedData = (transactionsToUse as any[]).map((transaction: any) => {
        const subtitle = transaction.subtitle
          ? transaction.subtitle
          : `${transaction.categoryId}${transaction.subcategoryId ? ` - ${transaction.subcategoryId}` : ''}`;
        const dateValue = transaction.date instanceof Date ? transaction.date : new Date(transaction.date);
        return {
          ...(transaction as UiTransaction),
          accountId: resolveAccountId(transaction.accountId, transaction.account),
          subtitle,
          date: dateValue,
        } as UiTransaction;
      });
      setTransactions(transformedData);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      const transformedData = mockRecordsData.map(transaction => ({
        ...transaction,
        accountId: resolveAccountId(transaction.accountId, transaction.account),
        date: transaction.date instanceof Date ? transaction.date : new Date(transaction.date),
        subtitle: transaction.subtitle
          ? transaction.subtitle
          : `${transaction.categoryId}${transaction.subcategoryId ? ` - ${transaction.subcategoryId}` : ''}`,
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

  useEffect(() => {
    if (!isFocused) {
      setFabOpen(false);
    }
  }, [isFocused]);

  // Amount slider support — default to 0..maxTransactionAbs
  const maxTransactionAbs = useMemo(() => {
    if (transactions.length === 0) return 100;
    return Math.max(100, ...transactions.map((t) => Math.abs(t.amount || 0)));
  }, [transactions]);

  // Local amount slider state used by the filter drawer
  const [localMinAmount, setLocalMinAmount] = useState<number>(0);
  const [localMaxAmount, setLocalMaxAmount] = useState<number>(maxTransactionAbs);

  const [localFilters, setLocalFilters] = useState({
    selectedPayers: [] as string[],
    selectedLabels: [] as string[],
    keyTerms: [] as string[],
    amountRange: null as { min: number; max: number } | null,
    dateRange: null as DateRange | null,
    selectedCategories: [] as string[],
    selectedAccount: 'all' as string,
  });

  useEffect(() => {
    if (showFilters) {
      setLocalFilters({
        selectedPayers: filters.selectedPayers || [],
        selectedLabels: filters.selectedLabels || [],
        keyTerms: filters.keyTerms || [],
        amountRange: filters.amountRange
          ? {
              min: filters.amountRange.min ?? 0,
              max: filters.amountRange.max ?? maxTransactionAbs,
            }
          : null,
        dateRange: filters.dateRange,
        selectedCategories: filters.selectedCategories,
        selectedAccount: filters.selectedAccount || 'all',
      });
      setLocalMinAmount(filters.amountRange?.min ?? 0);
      setLocalMaxAmount(filters.amountRange?.max ?? maxTransactionAbs);
    }
  }, [showFilters, filters, maxTransactionAbs]);

  const filteredAndSortedData = useMemo(() => {
    const filtered = transactions.filter((item) => {
      if (filters.selectedAccount && filters.selectedAccount !== 'all') {
        if (item.accountId !== filters.selectedAccount) {
          return false;
        }
      }

      if (selectedRecordType !== 'all' && selectedRecordType !== item.type) {
        return false;
      }
      // Also respect search category from global FilterContext (applies when navigated from search)
      if (filters.searchCategory && filters.searchCategory !== 'all' && filters.searchCategory !== item.type) {
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

      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        if (!item.title.toLowerCase().includes(search) && 
            !item.subtitle.toLowerCase().includes(search) &&
            !(item.payee && item.payee.toLowerCase().includes(search)) &&
            !(item.note && item.note.toLowerCase().includes(search)) &&
            !matchesLabelsSearch(item.labels, search)) {
          return false;
        }
      }

      if (filters.selectedPayers && filters.selectedPayers.length > 0) {
        const payee = (item.payee || '').trim();
        if (!filters.selectedPayers.includes(payee)) {
          return false;
        }
      }

      if (filters.selectedLabels && filters.selectedLabels.length > 0) {
        const labels = (item.labels || []).map((l: string) => l.trim());
        const matches = filters.selectedLabels.some((sel) => labels.includes(sel));
        if (!matches) {
          return false;
        }
      }

      if (filters.keyTerms && filters.keyTerms.length > 0) {
        const text = `${item.title} ${item.note || ''} ${item.payee || ''} ${(item.labels || []).join(' ')}`.toLowerCase();
        const allTermsPresent = filters.keyTerms.every((t) => text.includes(t.toLowerCase()));
        if (!allTermsPresent) {
          return false;
        }
      }

      // apply amount filter (absolute amount)
      if (filters.amountRange) {
        const abs = Math.abs(item.amount);
        const min = filters.amountRange.min ?? 0;
        const max = filters.amountRange.max ?? Number.MAX_VALUE;
        if (abs < min || abs > max) {
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
  }, [selectedRecordType, sortOption, filters.selectedAccount, filters.selectedCategories, filters.dateRange, filters.searchTerm, filters.amountRange, transactions]);

  const appliedFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.selectedAccount && filters.selectedAccount !== 'all') {
      count += 1;
    }
    if (selectedRecordType !== 'all') {
      count += 1;
    }
    if (filters.selectedCategories.length > 0) {
      count += 1;
    }
    if (filters.dateRange) {
      count += 1;
    }
    if (filters.amountRange && (filters.amountRange.min != null || filters.amountRange.max != null)) {
      count += 1;
    }
    if (filters.searchTerm) {
      count += 1;
    }
    if (filters.searchCategory && filters.searchCategory !== 'all') {
      count += 1;
    }
    if (filters.selectedPayers && filters.selectedPayers.length > 0) {
      count += 1;
    }
    if (filters.selectedLabels && filters.selectedLabels.length > 0) {
      count += 1;
    }
    if (filters.keyTerms && filters.keyTerms.length > 0) {
      count += 1;
    }
    return count;
  }, [filters.dateRange, filters.searchCategory, filters.searchTerm, filters.selectedCategories, selectedRecordType, filters.amountRange]);

  const filterIconColor = appliedFiltersCount > 0 ? palette.tint : palette.icon;
  const sortIconColor = sortOption === 'date-desc' ? palette.icon : palette.tint;
  const filterLabel = appliedFiltersCount > 0 ? `${appliedFiltersCount} filter${appliedFiltersCount > 1 ? 's' : ''} applied` : 'All filters';
  const sortLabel = SORT_OPTIONS.find(o => o.value === sortOption)?.label ?? 'Date (desc)';

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
      setCalendarMode('presets');
      if (filters.dateRange) {
        setDraftRange({ start: startOfDay(filters.dateRange.start), end: startOfDay(filters.dateRange.end) });
        setMonthCursor(startOfDay(filters.dateRange.start));
      } else {
        setDraftRange(null);
        setMonthCursor(startOfDay(new Date()));
      }
    }
  }, [showCalendarModal, filters.dateRange]);

  const formatCurrency = (value: number, type: 'income' | 'expense') => {
    const abs = Math.abs(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${type === 'income' ? '+' : '-'}$${abs}`;
  };

  const formatTimePeriod = (range: DateRange | null) => {
    if (!range) return 'All Time';
    const start = range.start;
    const end = range.end;
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      const startDay = start.toLocaleDateString('en-US', { weekday: 'short' });
      const endDay = end.toLocaleDateString('en-US', { weekday: 'short' });
      return `${startDay} - ${endDay}`;
    } else if (diffDays <= 31) {
      const startMonth = start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      const endMonth = end.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      return `${startMonth} - ${endMonth}`;
    } else {
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }
  };

  const selectedCategoryLabels = useMemo(() => 
    localFilters.selectedCategories
      .map(id => getNodeDisplayName(id))
      .filter((name): name is string => Boolean(name)),
    [localFilters.selectedCategories]
  );

  const uniquePayers = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach((t) => {
      const p = t.payee ?? '';
      if (!p.trim()) return;
      const key = p.trim();
      counts[key] = (counts[key] ?? 0) + 1;
    });
    // sort by frequency
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([payee]) => payee);
  }, [transactions]);

  const uniqueLabels = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach((t) => {
      (t.labels || []).forEach((lab: string) => {
        const key = lab.trim();
        if (!key) return;
        counts[key] = (counts[key] ?? 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([label]) => label);
  }, [transactions]);
  

  const filterSections = [
    {
      id: 'recordType',
      title: 'Record Type',
      detail: undefined,
      chips: ['Expense', 'Income', 'All'],
    },
    {
      id: 'categories',
      title: `Categories (${localFilters.selectedCategories.length || 'All'})`,
      detail: selectedCategoryLabels.length > 0 
        ? `${selectedCategoryLabels.slice(0, 3).join(', ')}${selectedCategoryLabels.length > 3 ? '...' : ''}`
        : 'Fuel, Groceries, Household…',
    },
    {
      id: 'payers',
      title: 'Payers, Payees',
      detail: localFilters.selectedPayers && localFilters.selectedPayers.length > 0 ? `${localFilters.selectedPayers.length} selected` : '—',
    },
    {
      id: 'labels',
      title: 'Labels (2)',
      detail: filters.selectedLabels && filters.selectedLabels.length > 0 ? `${filters.selectedLabels.length} selected` : 'Sale, Bargain',
    },
    {
      id: 'keyTerms',
      title: 'Key Terms (3)',
      detail: filters.keyTerms && filters.keyTerms.length > 0 ? filters.keyTerms.join(', ') : 'Black, Gift, Mom',
    },
    {
      id: 'amount',
      title: 'Amount',
      detail: '$5.00 - $75',
    },
    {
      id: 'accounts',
      title: filters.selectedAccount === 'all'
        ? 'Accounts (All)'
        : `Accounts (${getAccountMeta(filters.selectedAccount)?.name ?? 'Custom'})`,
      detail: filters.selectedAccount === 'all'
        ? undefined
        : getAccountMeta(filters.selectedAccount)?.subtitle,
    },
    {
      id: 'timePeriod',
      title: 'Time Period',
      detail: formatTimePeriod(filters.dateRange),
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={{ flex: 1, overflow: 'visible' }}>
        <View style={styles.header}>
          <View style={styles.filterRow}>
            <View style={styles.chipWrapper}>
              <TransactionTypeFilter
                value={selectedRecordType}
                onChange={setSelectedRecordType}
                options={['expense', 'income', 'all']}
                style={styles.chipRow}
                variant="compact"
                labelSize="small"
              />
            </View>
            <View style={styles.actionIcons}>
              <TouchableOpacity
                style={{ alignItems: 'center' }}
                onPress={() => setShowFilters(true)}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <View style={[styles.actionIcon, { borderColor: filterIconColor }]}>
                  <MaterialCommunityIcons name="tune-variant" size={18} color={filterIconColor} />
                </View>
                <ThemedText style={{ fontSize: FontSizes.xs, color: filterIconColor, marginTop: 2 }}>
                  {filterLabel}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ alignItems: 'center' }}
                onPress={() => setShowSortDropdown(!showSortDropdown)}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <View style={[styles.actionIcon, { borderColor: sortIconColor }]}>
                  <MaterialCommunityIcons name="swap-vertical" size={18} color={sortIconColor} />
                </View>
                <ThemedText style={{ fontSize: FontSizes.xs, color: sortIconColor, marginTop: 2 }}>
                  {sortLabel}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.recordsCard, { backgroundColor: palette.card, borderColor: palette.border }]}> 
          <FlatList
            data={filteredAndSortedData}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
              const isLast = index === filteredAndSortedData.length - 1;
              const amountColor = item.type === 'income' ? palette.success : palette.error;

              return (
                <View style={styles.itemContainer}>
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
                      <ThemedText style={[styles.itemTitle, { color: palette.text }]}>{getNodeDisplayName(item.subcategoryId) ?? getNodeDisplayName(item.categoryId) ?? item.title}</ThemedText>
                      <ThemedText style={[styles.itemSubtitle, { color: palette.icon }]}>{getAccountMeta(item.accountId)?.name ?? item.account}</ThemedText>
                      {/* show note or first label (only one) */}
                      { (item.note || (item.labels && item.labels.length > 0)) ? (
                        <ThemedText style={[styles.itemNote, { color: palette.icon, fontStyle: 'italic' }]}>{item.note ? item.note : (item.labels && item.labels.length > 0 ? item.labels[0] : '')}</ThemedText>
                      ) : null}
                    </View>
                    <View style={styles.itemMeta}>
                      <ThemedText
                        style={[
                          styles.itemAmount,
                          { color: amountColor },
                        ]}
                      >
                        {formatCurrency(item.amount, item.type)}
                      </ThemedText>
                      <ThemedText style={[styles.itemDate, { color: palette.icon }]}>{formatFriendlyDate(item.date)}</ThemedText>
                    </View>
                  </View>
                  {!isLast && <View style={[styles.listSeparator, { backgroundColor: palette.border }]} />}
                </View>
              );
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Spacing.lg }}
            ListFooterComponent={<View style={{ height: Spacing.md }} />}
          />
        </View>
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
                  // Reset global filters saved in context
                  resetFilters();
                  // reset local UI state as well
                  setLocalMinAmount(0);
                  setLocalMaxAmount(maxTransactionAbs);
                  setLocalFilters({
                    selectedPayers: [],
                    selectedLabels: [],
                    keyTerms: [],
                    amountRange: null,
                    dateRange: null,
                    selectedCategories: [],
                    selectedAccount: 'all',
                  });
                  setExpandedFilter(null);
                  // close drawer
                  setShowFilters(false);
                }}
              >
                <ThemedText style={{ color: accent, fontWeight: '600' }}>RESET</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.filterContent}>
              {filterSections.map((section) => {
                const isExpanded = expandedFilter === section.id;
                const isActive = (() => {
                  switch (section.id) {
                    case 'recordType':
                      return selectedRecordType !== 'all';
                    case 'categories':
                      return (filters.selectedCategories || []).length > 0;
                    case 'payers':
                      return (filters.selectedPayers || []).length > 0;
                    case 'labels':
                      return (filters.selectedLabels || []).length > 0;
                    case 'keyTerms':
                      return (filters.keyTerms || []).length > 0;
                    case 'amount':
                      return !!(filters.amountRange && (filters.amountRange.min != null || filters.amountRange.max != null));
                    case 'timePeriod':
                      return !!filters.dateRange;
                    case 'accounts':
                      return filters.selectedAccount && filters.selectedAccount !== 'all';
                    default:
                      return false;
                  }
                })();
                return (
                <View key={section.id}>
                  {section.id === 'categories' ? (
                    <TouchableOpacity onPress={() => router.push('/Category?from=filter')}>
                      <View style={[styles.filterRowItem, (isExpanded || isActive) && { backgroundColor: `${palette.tint}0F`, borderColor: palette.tint, borderWidth: 1 }]}> 
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
                      <TouchableOpacity
                        onPress={() => setExpandedFilter(prev => (prev === section.id ? null : section.id))}
                        activeOpacity={0.85}
                        style={{ flex: 1 }}
                      >
                        <View style={styles.filterRowText}>
                        <ThemedText style={[styles.filterRowTitle, { color: palette.text }]}>{section.title}</ThemedText>
                        {section.detail && (
                          <ThemedText style={{ color: palette.icon, marginTop: 4 }}>{section.detail}</ThemedText>
                        )}
                        {section.chips && section.id === 'recordType' && isExpanded && (
                          <TransactionTypeFilter
                            value={selectedRecordType}
                            onChange={setSelectedRecordType}
                            options={['expense', 'income', 'all']}
                            variant="compact"
                            labelSize="small"
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
                        {section.id === 'payers' && isExpanded && (
                          <View style={{ marginTop: Spacing.md }}>
                            <View style={styles.filterChipRow}>
                              {uniquePayers.slice(0, 8).map((payee) => {
                                const isActive = (filters.selectedPayers || []).includes(payee);
                                return (
                                  <TouchableOpacity
                                    key={payee}
                                    style={[styles.modalChip, isActive ? { backgroundColor: `${accent}15`, borderColor: accent } : { borderColor: palette.border }]}
                                    onPress={() => {
                                      const cur = filters.selectedPayers ?? [];
                                      if (cur.includes(payee)) {
                                        setSelectedPayers(cur.filter(p => p !== payee));
                                      } else {
                                        setSelectedPayers([...cur, payee]);
                                      }
                                    }}
                                  >
                                    <ThemedText style={[styles.modalChipLabel, { color: isActive ? accent : palette.icon }]}>{payee}</ThemedText>
                                  </TouchableOpacity>
                                );
                              })}
                              {uniquePayers.length === 0 && (
                                <ThemedText style={{ color: palette.icon, marginTop: Spacing.md }}>No payees found</ThemedText>
                              )}
                            </View>
                          </View>
                        )}
                        {section.id === 'labels' && isExpanded && (
                          <View style={{ marginTop: Spacing.md }}>
                            <View style={styles.filterChipRow}>
                              {uniqueLabels.slice(0, 8).map((lab) => {
                                const isActive = (filters.selectedLabels || []).includes(lab);
                                return (
                                  <TouchableOpacity
                                    key={lab}
                                    style={[styles.modalChip, isActive ? { backgroundColor: `${accent}15`, borderColor: accent } : { borderColor: palette.border }]}
                                    onPress={() => {
                                      const cur = filters.selectedLabels ?? [];
                                      if (cur.includes(lab)) {
                                        setSelectedLabels(cur.filter(l => l !== lab));
                                      } else {
                                        setSelectedLabels([...cur, lab]);
                                      }
                                    }}
                                  >
                                    <ThemedText style={[styles.modalChipLabel, { color: isActive ? accent : palette.icon }]}>{lab}</ThemedText>
                                  </TouchableOpacity>
                                );
                              })}
                              {uniqueLabels.length === 0 && (
                                <ThemedText style={{ color: palette.icon, marginTop: Spacing.md }}>No labels found</ThemedText>
                              )}
                            </View>
                          </View>
                        )}
                        {section.id === 'accounts' && isExpanded && (
                          <View style={{ marginTop: Spacing.md }}>
                            <View style={styles.filterChipRow}>
                              {mockAccounts.map((acc) => {
                                const isActive = filters.selectedAccount === acc.id;
                                return (
                                  <TouchableOpacity
                                    key={acc.id}
                                    style={[styles.modalChip, isActive ? { backgroundColor: `${accent}15`, borderColor: accent } : { borderColor: palette.border }]}
                                    onPress={() => setSelectedAccount(acc.id)}
                                  >
                                    <ThemedText style={[styles.modalChipLabel, { color: isActive ? accent : palette.icon }]}>{acc.name}</ThemedText>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          </View>
                        )}
                        {section.id === 'keyTerms' && isExpanded && (
                          <View style={{ marginTop: Spacing.md }}>
                            <KeyTermsEditor
                              terms={filters.keyTerms ?? []}
                              onChange={(terms) => setKeyTerms(terms)}
                            />
                          </View>
                        )}
                        {section.id === 'amount' && isExpanded && (
                          <View style={{ marginTop: Spacing.md }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs }}>
                              <ThemedText style={{ color: palette.icon }}>${localMinAmount.toFixed(2)}</ThemedText>
                              <ThemedText style={{ color: palette.icon }}>${localMaxAmount.toFixed(2)}</ThemedText>
                            </View>
                            {/* Use MultiSlider if available; fall back to two single sliders */}
                            {typeof MultiSlider !== 'undefined' ? (
                              <MultiSlider
                                values={[localMinAmount, localMaxAmount]}
                                onValuesChange={(vals: number[]) => {
                                  setLocalMinAmount(Math.round(vals[0]));
                                  setLocalMaxAmount(Math.round(vals[1]));
                                }}
                                onValuesChangeFinish={(vals: number[] = [localMinAmount, localMaxAmount]) => {
                                  setAmountRange({ min: Math.round(vals[0]), max: Math.round(vals[1]) });
                                }}
                                min={0}
                                max={maxTransactionAbs}
                                step={1}
                                selectedStyle={{ backgroundColor: palette.tint }}
                                unselectedStyle={{ backgroundColor: palette.border }}
                              />
                            ) : (
                              <>
                                <Slider
                                  minimumValue={0}
                                  maximumValue={maxTransactionAbs}
                                  step={1}
                                  value={localMaxAmount}
                                  onValueChange={(val) => setLocalMaxAmount(Math.round(val))}
                                  onSlidingComplete={(val: number) => {
                                    const newMax = Math.round(val);
                                    // make sure min/max ordering is valid
                                    if (newMax < localMinAmount) {
                                      setLocalMinAmount(newMax);
                                    }
                                    setLocalMaxAmount(newMax);
                                    setAmountRange({ min: Math.round(localMinAmount), max: newMax });
                                  }}
                                  minimumTrackTintColor={palette.tint}
                                  maximumTrackTintColor={palette.border}
                                />
                                <Slider
                                  minimumValue={0}
                                  maximumValue={maxTransactionAbs}
                                  step={1}
                                  value={localMinAmount}
                                  onValueChange={(val) => setLocalMinAmount(Math.round(val))}
                                  onSlidingComplete={(val: number) => {
                                    const newMin = Math.round(val);
                                    if (newMin > localMaxAmount) {
                                      setLocalMaxAmount(newMin);
                                    }
                                    setLocalMinAmount(newMin);
                                    setAmountRange({ min: newMin, max: Math.round(localMaxAmount) });
                                  }}
                                  minimumTrackTintColor={palette.tint}
                                  maximumTrackTintColor={palette.border}
                                />
                              </>
                            )}
                          </View>
                        )}
                        </View>
                      </TouchableOpacity>

                      <MaterialCommunityIcons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={22} color={palette.icon} />
                    </View>
                  )}
                  <View style={[styles.separator, { backgroundColor: palette.border }]} />
                </View>
              );
              })}
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
            {calendarMode === 'presets' ? (
              <>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
                    <MaterialCommunityIcons name="close" size={24} color={palette.icon} />
                  </TouchableOpacity>
                  <ThemedText style={[styles.calendarTitle, { color: palette.text }]}>Select Time Period</ThemedText>
                  <View style={{ width: 24 }} />
                </View>
                <View style={styles.calendarPresetList}>
                  <TouchableOpacity
                    style={[styles.presetButton, { borderColor: palette.border }]}
                    onPress={() => quickSelect('week')}
                  >
                    <ThemedText style={[styles.presetButtonText, { color: palette.text }]}>This Week</ThemedText>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={palette.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.presetButton, { borderColor: palette.border }]}
                    onPress={() => quickSelect('month')}
                  >
                    <ThemedText style={[styles.presetButtonText, { color: palette.text }]}>This Month</ThemedText>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={palette.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.presetButton, { borderColor: palette.border }]}
                    onPress={() => quickSelect('all')}
                  >
                    <ThemedText style={[styles.presetButtonText, { color: palette.text }]}>All Time</ThemedText>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={palette.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.presetButton, { borderColor: palette.border }]}
                    onPress={() => setCalendarMode('custom')}
                  >
                    <ThemedText style={[styles.presetButtonText, { color: palette.text }]}>Custom</ThemedText>
                    <MaterialCommunityIcons name="calendar-range" size={20} color={accent} />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity onPress={() => setCalendarMode('presets')}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color={palette.icon} />
                  </TouchableOpacity>
                  <ThemedText style={[styles.calendarTitle, { color: palette.text }]}>Custom Range</ThemedText>
                  <TouchableOpacity onPress={handleConfirm}>
                    <ThemedText style={{ color: accent, fontWeight: '600' }}>DONE</ThemedText>
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
              </>
            )}
          </View>
        </View>
      </Modal>

      {isFocused && (
        <Portal>
          {fabOpen && <Pressable style={styles.fabBackdrop} onPress={() => setFabOpen(false)} />}
          <FAB.Group
            open={fabOpen}
            visible
            icon={fabOpen ? 'close' : 'plus'}
            actions={fabActions}
            onStateChange={({ open }) => setFabOpen(open)}
            fabStyle={[styles.fabMain, { backgroundColor: palette.tint }]}
            backdropColor="transparent"
            color="white"
            style={[styles.fabGroupContainer, { bottom: tabBarHeight + Spacing.md }]}
          />
        </Portal>
      )}
    </SafeAreaView>
  );
}

const styles = recordsStyles;