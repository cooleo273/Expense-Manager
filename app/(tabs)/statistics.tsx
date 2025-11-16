import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLabel } from 'victory-native';

import { ExpenseStructureCard } from '@/components/ExpenseStructureCard';
import { TransactionTypeFilter, TransactionTypeValue } from '@/components/TransactionTypeFilter';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCategoryColor, getCategoryDefinition, type CategoryKey } from '@/constants/categories';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { statisticsStyles } from '@/styles/statistics.styles';
import { mockRecordsData } from '../../constants/mock-data';
import { useFilterContext } from '../../contexts/FilterContext';
import { StorageService } from '../../services/storage';

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const formatDateRange = (range: { start: Date; end: Date } | null) => {
  if (!range) {
    return 'All Time';
  }

  const { start, end } = range;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 7) {
    // Assume it's a week, show day names
    const startDay = start.toLocaleDateString('en-US', { weekday: 'short' });
    const endDay = end.toLocaleDateString('en-US', { weekday: 'short' });
    return `${startDay} - ${endDay}`;
  }

  // Check if it's a full month
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

  const weeklyAmounts = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    
    const amounts: Record<'expense' | 'income', number[]> = {
      expense: [0, 0, 0, 0, 0, 0, 0],
      income: [0, 0, 0, 0, 0, 0, 0]
    };

    filteredTransactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const dayDiff = Math.floor((transactionDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff >= 0 && dayDiff < 7) {
        if (transaction.type === 'expense') {
          amounts.expense[dayDiff] += Math.abs(transaction.amount);
        } else if (transaction.type === 'income') {
          amounts.income[dayDiff] += transaction.amount;
        }
      }
    });

    return amounts;
  }, [filteredTransactions]);

  const activeSeries = weeklyAmounts[selectedType];

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  const maxDataValue = useMemo(
    () => activeSeries.reduce((max, value) => Math.max(max, value), 0),
    [activeSeries]
  );

  const weeklyChartData = useMemo(
    () =>
      WEEK_LABELS.map((label, index) => ({
        x: label,
        y: activeSeries[index],
      })),
    [activeSeries]
  );

  const yAxisTickValues = useMemo(() => {
    if (maxDataValue === 0) {
      return [0, 1, 2, 3];
    }
    const steps = 4;
    const stepSize = Math.max(1, Math.ceil(maxDataValue / steps));
    return Array.from({ length: steps + 1 }, (_, idx) => idx * stepSize);
  }, [maxDataValue]);

  const weeklyTotal = activeSeries.reduce((sum, value) => sum + value, 0);
  let peakIndex = 0;
  activeSeries.forEach((value, index) => {
    if (value > activeSeries[peakIndex]) {
      peakIndex = index;
    }
  });
  const weekendTotal = activeSeries.slice(5).reduce((sum, value) => sum + value, 0);
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

  const weekendShare = weeklyTotal === 0 ? 0 : Math.round((weekendTotal / weeklyTotal) * 100);
  const dailyAverage = weeklyTotal === 0 ? 0 : Math.round(weeklyTotal / activeSeries.length);

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

          <ThemedView style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <MaterialCommunityIcons name="chart-bar" size={20} color={palette.tint} />
              <ThemedText type="subtitle">Weekly Breakdown</ThemedText>
            </View>
            <ThemedText style={{ color: palette.icon }}>
              {selectedType === 'income' ? 'Income overview' : 'Expense overview'}
            </ThemedText>
          </View>
          <View style={[styles.chart, { width: chartWidth }]}>
            <VictoryChart
              animate={{ duration: 600 }}
              height={240}
              padding={{ top: 32, bottom: 56, left: 56, right: 24 }}
              domainPadding={{ x: 24, y: [0, 12] }}
              width={chartWidth}
            >
              <VictoryAxis
                style={{
                  axis: { stroke: palette.border },
                  tickLabels: { fill: palette.icon, fontSize: 12, padding: 12 },
                  ticks: { stroke: palette.border },
                }}
              />
              <VictoryAxis
                dependentAxis
                tickValues={yAxisTickValues}
                tickFormat={(value: number) => formatCurrency(value)}
                style={{
                  axis: { stroke: palette.border },
                  grid: { stroke: palette.border, strokeDasharray: '4,4' },
                  tickLabels: { fill: palette.icon, fontSize: 12, padding: 8 },
                  ticks: { stroke: palette.border },
                }}
              />
              <VictoryBar
                data={weeklyChartData}
                barWidth={24}
                cornerRadius={{ top: 8, bottom: 8 }}
                labels={({ datum }: { datum: { y: number } }) =>
                  datum.y ? formatCurrency(datum.y) : ''
                }
                labelComponent={
                  <VictoryLabel
                    dy={-8}
                    style={{ fill: palette.icon, fontSize: 12, fontWeight: '600' }}
                  />
                }
                style={{ data: { fill: palette.tint } }}
              />
            </VictoryChart>
          </View>
          <View style={styles.barSummaryRow}>
            <View style={styles.barSummaryBlock}>
              <ThemedText style={[styles.summaryLabel, { color: palette.icon }]}>Total</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: palette.text }]}>${weeklyTotal.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.barSummaryBlock}>
              <ThemedText style={[styles.summaryLabel, { color: palette.icon }]}>Peak day</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: palette.text }]}>{WEEK_LABELS[peakIndex]}</ThemedText>
            </View>
            <View style={styles.barSummaryBlock}>
              <ThemedText style={[styles.summaryLabel, { color: palette.icon }]}>Daily avg</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: palette.text }]}>${dailyAverage.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.barSummaryBlock}>
              <ThemedText style={[styles.summaryLabel, { color: palette.icon }]}>Weekend</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: palette.text }]}>{weekendShare}%</ThemedText>
            </View>
          </View>
        </ThemedView>

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