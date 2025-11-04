import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLabel } from 'victory-native';

import { ExpenseStructureCard } from '@/components/ExpenseStructureCard';
import { TransactionTypeFilter, TransactionTypeValue } from '@/components/TransactionTypeFilter';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { statisticsStyles } from '@/styles/statistics.styles';
import { mockCategoryBreakdown, mockWeeklyAmounts } from '../mock-data';

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

  const activeSeries = mockWeeklyAmounts[selectedType];

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

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
          data={mockCategoryBreakdown}
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