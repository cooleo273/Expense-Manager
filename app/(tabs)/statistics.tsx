import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BreakdownChart } from '@/components/BreakdownChart';
import { ExpenseStructureCard } from '@/components/ExpenseStructureCard';
import { TransactionTypeFilter, TransactionTypeValue } from '@/components/TransactionTypeFilter';
import { ThemedText } from '@/components/themed-text';
import { getCategoryColor, getCategoryDefinition, type CategoryKey } from '@/constants/categories';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { statisticsStyles } from '@/styles/statistics.styles';
import { mockRecordsData } from '../../constants/mock-data';
import { useFilterContext } from '../../contexts/FilterContext';
import { StorageService } from '../../services/storage';


const formatDateRange = (range: { start: Date; end: Date } | null) => {
  if (!range) {
    return 'All Time';
  }

  const { start, end } = range;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 7) {
    const startDay = start.toLocaleDateString('en-US', { weekday: 'short' });
    const endDay = end.toLocaleDateString('en-US', { weekday: 'short' });
    return `${startDay} - ${endDay}`;
  }

  const startOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  const endOfMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  if (start.getTime() === startOfMonth.getTime() && end.getTime() === endOfMonth.getTime()) {
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
  } else {
    return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${endYear}`;
  }
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
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const windowWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(windowWidth - 64, 280);
  const expenseChartSize = Math.min(Math.max(windowWidth * 0.4, 180), 250);
  const tabBarHeight = useBottomTabBarHeight();
  const { filters } = useFilterContext();

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
  }, [loadTransactions]);

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

      return true;
    });
  }, [filters.dateRange, filters.searchTerm, transactions]);

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
        const category = getCategoryDefinition(categoryId);
        return {
          id: categoryId,
          label: category?.name ?? categoryId,
          value,
          color: getCategoryColor(categoryId, palette.tint),
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, palette.tint]);

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
            {formatDateRange(filters.dateRange)}
          </ThemedText>
        </View>

        <BreakdownChart
          transactions={filteredTransactions}
          selectedType={selectedType}
          dateRange={filters.dateRange}
        />

        <ExpenseStructureCard
          title="Expense Structure"
          subtitle="Top categories"
          icon="chart-pie"
          data={expenseSegments}
          totalLabel={`$${expenseSegments.reduce((sum, segment) => sum + segment.value, 0).toLocaleString()}`}
          totalCaption="All time"
          legendVariant="simple"
          valueFormatter={(value) => `$${value.toLocaleString()}`}
          containerStyle={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
          chartSize={expenseChartSize}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = statisticsStyles;