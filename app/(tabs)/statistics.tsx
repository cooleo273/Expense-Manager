import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BreakdownChart } from '@/components/BreakdownChart';
import { ExpenseStructureCard } from '@/components/ExpenseStructureCard';
import { TransactionTypeFilter, TransactionTypeValue } from '@/components/TransactionTypeFilter';
import { ThemedText } from '@/components/themed-text';
import { getCategoryColor, getNodeDisplayName, type CategoryKey } from '@/constants/categories';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { statisticsStyles } from '@/styles/statistics.styles';
import { formatCompactCurrency } from '@/utils/currency';
import { getRelativePeriodLabel, startOfDay } from '@/utils/date';
import { mockRecordsData } from '../../constants/mock-data';
import { useFilterContext } from '../../contexts/FilterContext';
import { StorageService } from '../../services/storage';

const incomeColorForKey = (key: string) => {
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = key.charCodeAt(index) + ((hash << 5) - hash);
  }
  const adjustChannel = (value: number) => {
    const normalized = (value & 0xff);
    const mixed = Math.floor(normalized * 0.6 + 96);
    return mixed.toString(16).padStart(2, '0');
  };
  const r = adjustChannel(hash);
  const g = adjustChannel(hash >> 8);
  const b = adjustChannel(hash >> 16);
  return `#${r}${g}${b}`;
};


const formatDateRange = (range: { start: Date; end: Date } | null, t: (key: string) => string) => {
  const presetLabel = getRelativePeriodLabel(range);
  if (presetLabel) {
    return presetLabel;
  }

  if (!range) {
    return t('all_time');
  }

  const { start, end } = range;
  const diffTime = Math.abs(startOfDay(end).getTime() - startOfDay(start).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 7) {
    const startDay = start.toLocaleDateString('en-US', { weekday: 'short' });
    const endDay = end.toLocaleDateString('en-US', { weekday: 'short' });
    return `${startDay} - ${endDay}`;
  }

  const startOfMonth = startOfDay(new Date(start.getFullYear(), start.getMonth(), 1));
  const endOfMonth = startOfDay(new Date(start.getFullYear(), start.getMonth() + 1, 0));
  if (startOfDay(start).getTime() === startOfMonth.getTime() && startOfDay(end).getTime() === endOfMonth.getTime()) {
    return start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
  }

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear !== endYear) {
    return `${startMonth} ${start.getDate()}, ${startYear} - ${endMonth} ${end.getDate()}, ${endYear}`;
  }

  if (startMonth !== endMonth) {
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${endYear}`;
  }

  return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${endYear}`;
};

const matchesLabelsSearch = (labels: string[] | string | undefined, search: string) => {
  if (!labels) {
    return false;
  }
  if (Array.isArray(labels)) {
    return labels.some((label) => label.toLowerCase().includes(search));
  }
  return labels.toLowerCase().includes(search);
};

export default function Statistics() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const windowWidth = Dimensions.get('window').width;
  const expenseChartSize = Math.min(Math.max(windowWidth * 0.4, 180), 250);
  const tabBarHeight = useBottomTabBarHeight();
  const { filters, applyDateFilter } = useFilterContext();
  const navigation = useNavigation();

  const [selectedType, setSelectedType] = useState<'expense' | 'income'>('expense');
  const [transactions, setTransactions] = useState<any[]>([]);

  const loadTransactions = useCallback(async () => {
    try {
      const data = await StorageService.getTransactions();
      const transactionsToUse = data.length > 0 ? data : mockRecordsData;
      const transformedData = transactionsToUse.map(transaction => ({
        ...transaction,
        date: new Date(transaction.date), // Convert string to Date
        dateLabel: new Date(transaction.date).toLocaleDateString(), // Add dateLabel
        subtitle: `${transaction.categoryId}${transaction.subcategoryId ? ` - ${transaction.subcategoryId}` : ''}`, // Add subtitle
      }));
      setTransactions(transformedData);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      const transformedData = mockRecordsData.map(transaction => ({
        ...transaction,
        date: new Date(transaction.date), 
        dateLabel: new Date(transaction.date).toLocaleDateString(), 
        subtitle: `${transaction.categoryId}${transaction.subcategoryId ? ` - ${transaction.subcategoryId}` : ''}`, // Add subtitle
      }));
      setTransactions(transformedData);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
    navigation.setOptions({
      headerTitle: '',
    } as any);
  }, [loadTransactions, navigation]);

  useEffect(() => {
    if (!filters.dateRange && (filters.datePreset === null || filters.datePreset === undefined)) {
      const now = new Date();
      const start = startOfDay(new Date(now.getFullYear(), 0, 1));
      const end = startOfDay(new Date(now.getFullYear(), 11, 31));
      applyDateFilter({ start, end }, 'year');
    }
  }, [filters.dateRange, filters.datePreset, applyDateFilter]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  const handleTypeChange = (next: TransactionTypeValue) => {
    if (next === 'all') {
      return;
    }
    setSelectedType(next);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((record) => {
      if (filters.dateRange) {
        if (record.date < filters.dateRange.start || record.date > filters.dateRange.end) {
          return false;
        }
      }

      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        if (!record.title.toLowerCase().includes(search) && 
            !record.subtitle.toLowerCase().includes(search) &&
            !(record.payee && record.payee.toLowerCase().includes(search)) &&
            !(record.note && record.note.toLowerCase().includes(search)) &&
            !matchesLabelsSearch(record.labels, search)) {
          return false;
        }
      }

      if (filters.selectedAccount && filters.selectedAccount !== 'all') {
        if (record.accountId !== filters.selectedAccount) {
          return false;
        }
      }

      return true;
    });
  }, [filters.dateRange, filters.searchTerm, filters.selectedAccount, transactions]);

  const expenseSegments = useMemo(() => {
    const totals = new Map<CategoryKey, number>();

    filteredTransactions.forEach((record) => {
      if (record.type !== 'expense') {
        return;
      }
      const amount = Math.abs(record.amount);
      totals.set(record.categoryId, (totals.get(record.categoryId) ?? 0) + amount);
    });

    return Array.from(totals.entries())
      .map(([categoryId, value]) => {
        const label = getNodeDisplayName(categoryId) ?? categoryId;
        return {
          id: categoryId,
          label,
          value,
          color: getCategoryColor(categoryId, palette.tint),
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, palette.tint]);

  const incomeSegments = useMemo(() => {
    const totals = new Map<string, number>();

    filteredTransactions.forEach((record) => {
      if (record.type !== 'income') {
        return;
      }
      const amount = Math.abs(record.amount);
      const key = record.subcategoryId ?? record.categoryId ?? 'income';
      totals.set(key, (totals.get(key) ?? 0) + amount);
    });

    return Array.from(totals.entries())
      .map(([segmentId, value]) => {
        const label = getNodeDisplayName(segmentId) ?? segmentId;
        return {
          id: segmentId,
          label,
          value,
          color: incomeColorForKey(segmentId),
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const structureSegments = selectedType === 'income' ? incomeSegments : expenseSegments;
  const structureTitle = selectedType === 'income' ? t('income_structure') : t('expense_structure');
  const structureSubtitle = selectedType === 'income' ? t('top_subcategories') : t('top_categories');
  const structureLegendVariant: 'simple' | 'detailed' = 'simple';
  const structureTotalValue = useMemo(
    () => structureSegments.reduce((sum, segment) => sum + segment.value, 0),
    [structureSegments]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: palette.background, paddingBottom: tabBarHeight + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        
        <View style={styles.filterRow}>
          <TransactionTypeFilter
            value={selectedType}
            onChange={handleTypeChange}
            options={['expense', 'income']}
          />
          <ThemedText style={{ color: palette.icon }}>
            {formatDateRange(filters.dateRange, t)}
          </ThemedText>
        </View>

        <BreakdownChart
          transactions={filteredTransactions}
          selectedType={selectedType}
          dateRange={filters.dateRange}
          datePreset={filters.datePreset}
        />

        <ExpenseStructureCard
          title={structureTitle}
          subtitle={structureSubtitle}
          icon="chart-pie"
          data={structureSegments}
          totalLabel={formatCompactCurrency(structureTotalValue)}
          totalCaption={t('all_time')}
          legendVariant={structureLegendVariant}
          valueFormatter={(value) => formatCompactCurrency(value)}
          fullValueFormatter={(value) => `$${value.toLocaleString()}`}
          containerStyle={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
          chartSize={expenseChartSize}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = statisticsStyles;