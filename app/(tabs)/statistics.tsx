import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

import { statisticsStyles } from '@/app/styles/statistics.styles';
import { ExpenseStructureCard } from '@/components/ExpenseStructureCard';
import { TransactionTypeFilter, TransactionTypeValue } from '@/components/TransactionTypeFilter';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WEEKLY_AMOUNTS: Record<'expense' | 'income', number[]> = {
  expense: [95, 120, 60, 85, 190, 70, 45],
  income: [210, 160, 120, 140, 260, 180, 140],
};

const CATEGORY_BREAKDOWN = [
  { id: 'household', label: 'Household', value: 480, percent: 28, color: '#4F46E5' },
  { id: 'vehicle', label: 'Vehicle', value: 320, percent: 19, color: '#F97316' },
  { id: 'utilities', label: 'Utilities', value: 210, percent: 12, color: '#0EA5E9' },
  { id: 'others', label: 'Others', value: 140, percent: 8, color: '#22C55E' },
];

export default function Statistics() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const windowWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(windowWidth - 64, 280);
  const expenseChartSize = Math.min(Math.max(windowWidth * 0.55, 220), 320);

  const [selectedType, setSelectedType] = useState<'expense' | 'income'>('expense');

  const handleTypeChange = (next: TransactionTypeValue) => {
    if (next === 'all') {
      return;
    }
    setSelectedType(next);
  };

  const activeSeries = WEEKLY_AMOUNTS[selectedType];

  const weeklyBarData = useMemo(
    () => ({
      labels: WEEK_LABELS,
      datasets: [
        {
          data: activeSeries,
          color: () => palette.tint,
        },
      ],
    }),
    [activeSeries, palette.tint]
  );

  const barChartConfig = useMemo(
    () => ({
      backgroundGradientFrom: palette.card,
      backgroundGradientTo: palette.card,
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
      fillShadowGradient: palette.tint,
      fillShadowGradientOpacity: 0.85,
      propsForBackgroundLines: {
        strokeDasharray: '',
        stroke: palette.border,
      },
      barPercentage: 0.55,
    }),
    [palette]
  );

  const weeklyTotal = activeSeries.reduce((sum, value) => sum + value, 0);
  let peakIndex = 0;
  activeSeries.forEach((value, index) => {
    if (value > activeSeries[peakIndex]) {
      peakIndex = index;
    }
  });
  const weekendTotal = activeSeries.slice(5).reduce((sum, value) => sum + value, 0);
  const weekendShare = weeklyTotal === 0 ? 0 : Math.round((weekendTotal / weeklyTotal) * 100);
  const dailyAverage = weeklyTotal === 0 ? 0 : Math.round(weeklyTotal / activeSeries.length);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: palette.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.toolbar}>
          <View style={styles.titleRow}>
            <ThemedText style={[styles.toolbarTitle, { color: palette.text }]}>All Accounts</ThemedText>
            <MaterialCommunityIcons name="chevron-down" size={18} color={palette.icon} />
          </View>
          <TouchableOpacity style={[styles.calendarButton, { borderColor: palette.border }]}> 
            <MaterialCommunityIcons name="calendar-month" size={20} color={palette.tint} />
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <TransactionTypeFilter
            value={selectedType}
            onChange={handleTypeChange}
            options={['expense', 'income']}
          />
          <ThemedText style={{ color: palette.icon }}>This Week</ThemedText>
        </View>

        <ThemedView style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}> 
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Weekly Breakdown</ThemedText>
            <ThemedText style={{ color: palette.icon }}>
              {selectedType === 'income' ? 'Income overview' : 'Expense overview'}
            </ThemedText>
          </View>
          <BarChart
            data={weeklyBarData}
            width={chartWidth}
            height={220}
            chartConfig={barChartConfig}
            showBarTops
            fromZero
            yAxisLabel=""
            yAxisSuffix=""
            style={styles.chart}
            withInnerLines
          />
          <View style={styles.barSummaryRow}>
            <View style={styles.barSummaryBlock}>
              <ThemedText style={[styles.summaryLabel, { color: palette.icon }]}>Total</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: palette.text }]}>₹{weeklyTotal.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.barSummaryBlock}>
              <ThemedText style={[styles.summaryLabel, { color: palette.icon }]}>Peak day</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: palette.text }]}>{WEEK_LABELS[peakIndex]}</ThemedText>
            </View>
            <View style={styles.barSummaryBlock}>
              <ThemedText style={[styles.summaryLabel, { color: palette.icon }]}>Daily avg</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: palette.text }]}>₹{dailyAverage.toLocaleString()}</ThemedText>
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
          data={CATEGORY_BREAKDOWN}
          totalLabel={`₹${weeklyTotal.toLocaleString()}`}
          totalCaption="This week"
          legendVariant="detailed"
          valueFormatter={(value) => `₹${value.toLocaleString()}`}
          containerStyle={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
          chartSize={expenseChartSize}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = statisticsStyles;