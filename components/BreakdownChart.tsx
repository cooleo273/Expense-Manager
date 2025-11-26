import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Dimensions, View } from 'react-native';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLabel } from 'victory-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { statisticsStyles } from '@/styles/statistics.styles';

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_LABELS = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const YEAR_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type DateRange = {
  start: Date;
  end: Date;
};

type Transaction = {
  date: Date;
  type: 'expense' | 'income';
  amount: number;
};

type BreakdownType = 'week' | 'month' | 'year' | 'all';

interface BreakdownChartProps {
  transactions: Transaction[];
  selectedType: 'expense' | 'income';
  dateRange: DateRange | null;
}

const isThisWeek = (range: DateRange) => {
  const now = new Date();
  const start = new Date(now);
  const weekday = (start.getDay() + 6) % 7; // Monday start
  start.setDate(start.getDate() - weekday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(0, 0, 0, 0);
  return range.start.getTime() === start.getTime() && range.end.getTime() === end.getTime();
};

const isThisMonth = (range: DateRange) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  end.setHours(0, 0, 0, 0);
  return range.start.getTime() === start.getTime() && range.end.getTime() === end.getTime();
};

const isThisYear = (range: DateRange) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now.getFullYear(), 11, 31);
  end.setHours(0, 0, 0, 0);
  return range.start.getTime() === start.getTime() && range.end.getTime() === end.getTime();
};

const getBreakdownType = (dateRange: DateRange | null): BreakdownType => {
  if (!dateRange) return 'all';
  if (isThisWeek(dateRange)) return 'week';
  if (isThisMonth(dateRange)) return 'month';
  if (isThisYear(dateRange)) return 'year';
  // Default to week for custom ranges
  return 'week';
};

export const BreakdownChart: React.FC<BreakdownChartProps> = ({
  transactions,
  selectedType,
  dateRange,
}) => {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const windowWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(windowWidth - 64, 280);

  const breakdownType = getBreakdownType(dateRange);

  const breakdownData = React.useMemo(() => {
    let amounts: number[] = [];
    let labels: string[] = [];
    let numPeriods = 0;

    if (breakdownType === 'week') {
      numPeriods = 7;
      labels = WEEK_LABELS;
      const now = new Date();
      const weekStart = new Date(now);
      const weekday = (weekStart.getDay() + 6) % 7;
      weekStart.setDate(now.getDate() - weekday);
      weekStart.setHours(0, 0, 0, 0);

      amounts = new Array(7).fill(0);
      transactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.date);
        const dayDiff = Math.floor((transactionDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff >= 0 && dayDiff < 7) {
          if (transaction.type === selectedType) {
            amounts[dayDiff] += Math.abs(transaction.amount);
          }
        }
      });
    } else if (breakdownType === 'month') {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const weeksInMonth = Math.ceil(daysInMonth / 7);
      numPeriods = weeksInMonth;
      labels = Array.from({ length: weeksInMonth }, (_, i) => `Week ${i + 1}`);
      amounts = new Array(weeksInMonth).fill(0);

      transactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.date);
        if (transactionDate.getFullYear() === year && transactionDate.getMonth() === month) {
          const day = transactionDate.getDate() - 1;
          const weekIndex = Math.floor(day / 7);
          if (transaction.type === selectedType) {
            amounts[weekIndex] += Math.abs(transaction.amount);
          }
        }
      });
    } else if (breakdownType === 'year') {
      numPeriods = 12;
      labels = YEAR_LABELS;
      amounts = new Array(12).fill(0);
      const year = new Date().getFullYear();

      transactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.date);
        if (transactionDate.getFullYear() === year) {
          const month = transactionDate.getMonth();
          if (transaction.type === selectedType) {
            amounts[month] += Math.abs(transaction.amount);
          }
        }
      });
    } else if (breakdownType === 'all') {
      const years = new Set<number>();
      transactions.forEach(t => years.add(new Date(t.date).getFullYear()));
      const sortedYears = Array.from(years).sort();
      numPeriods = sortedYears.length;
      labels = sortedYears.map(y => y.toString());
      amounts = new Array(sortedYears.length).fill(0);
      const yearIndex = sortedYears.reduce((map, y, i) => map.set(y, i), new Map<number, number>());

      transactions.forEach((transaction) => {
        const year = new Date(transaction.date).getFullYear();
        const idx = yearIndex.get(year)!;
        if (transaction.type === selectedType) {
          amounts[idx] += Math.abs(transaction.amount);
        }
      });
    }

    return { amounts, labels, numPeriods };
  }, [transactions, selectedType, dateRange, breakdownType]);

  const { amounts, labels, numPeriods } = breakdownData;

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  const maxDataValue = amounts.reduce((max, value) => Math.max(max, value), 0);

  const chartData = labels.map((label, index) => ({
    x: label,
    y: amounts[index],
  }));

  const yAxisTickValues = React.useMemo(() => {
    if (maxDataValue === 0) {
      return [0, 1, 2, 3];
    }
    const steps = 4;
    const stepSize = Math.max(1, Math.ceil(maxDataValue / steps));
    return Array.from({ length: steps + 1 }, (_, idx) => idx * stepSize);
  }, [maxDataValue]);

  const total = amounts.reduce((sum, value) => sum + value, 0);
  let peakIndex = 0;
  amounts.forEach((value, index) => {
    if (value > amounts[peakIndex]) {
      peakIndex = index;
    }
  });

  const dailyAverage = total === 0 ? 0 : Math.round(total / numPeriods);

  let subtitle = '';
  let summaryBlocks: { label: string; value: string }[] = [];

  if (breakdownType === 'week') {
    subtitle = 'Weekly Breakdown';
    const weekendTotal = amounts.slice(5).reduce((sum, value) => sum + value, 0);
    const weekendShare = total === 0 ? 0 : Math.round((weekendTotal / total) * 100);
    summaryBlocks = [
      { label: 'Total', value: `$${total.toLocaleString()}` },
      { label: 'Peak day', value: labels[peakIndex] },
      { label: 'Daily avg', value: `$${dailyAverage.toLocaleString()}` },
      { label: 'Weekend', value: `${weekendShare}%` },
    ];
  } else if (breakdownType === 'month') {
    subtitle = 'Monthly Breakdown';
    // For month, perhaps weekday vs weekend
    const weekdayTotal = amounts.slice(0, 5).reduce((sum, value) => sum + value, 0) + amounts.slice(5, 7).reduce((sum, value) => sum + value, 0); // Mon-Fri + Sat-Sun but wait, better calculate properly
    // Actually, for simplicity, just total, peak day, daily avg, and maybe highest week or something. But to keep similar, perhaps remove weekend.
    summaryBlocks = [
      { label: 'Total', value: `$${total.toLocaleString()}` },
      { label: 'Peak week', value: labels[peakIndex] },
      { label: 'Weekly avg', value: `$${dailyAverage.toLocaleString()}` },
      { label: 'Weeks active', value: amounts.filter(a => a > 0).length.toString() },
    ];
  } else if (breakdownType === 'year') {
    subtitle = 'Yearly Breakdown';
    const quarterlyTotal = [amounts.slice(0, 3).reduce((s, v) => s + v, 0), amounts.slice(3, 6).reduce((s, v) => s + v, 0), amounts.slice(6, 9).reduce((s, v) => s + v, 0), amounts.slice(9, 12).reduce((s, v) => s + v, 0)];
    const peakQuarter = quarterlyTotal.indexOf(Math.max(...quarterlyTotal)) + 1;
    summaryBlocks = [
      { label: 'Total', value: `$${total.toLocaleString()}` },
      { label: 'Peak month', value: labels[peakIndex] },
      { label: 'Monthly avg', value: `$${dailyAverage.toLocaleString()}` },
      { label: 'Peak quarter', value: `Q${peakQuarter}` },
    ];
  } else if (breakdownType === 'all') {
    subtitle = 'All Time Breakdown';
    summaryBlocks = [
      { label: 'Total', value: `$${total.toLocaleString()}` },
      { label: 'Peak year', value: labels[peakIndex] },
      { label: 'Yearly avg', value: `$${dailyAverage.toLocaleString()}` },
      { label: 'Years active', value: amounts.filter(a => a > 0).length.toString() },
    ];
  }

  return (
    <ThemedView style={[statisticsStyles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <View style={statisticsStyles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <MaterialCommunityIcons name="chart-bar" size={20} color={palette.tint} />
          <ThemedText type="subtitle">{subtitle}</ThemedText>
        </View>
        <ThemedText style={{ color: palette.icon }}>
          {selectedType === 'income' ? 'Income overview' : 'Expense overview'}
        </ThemedText>
      </View>
      <View style={[statisticsStyles.chart, { width: chartWidth }]}>
        <VictoryChart
          animate={{ duration: 600 }}
          height={240}
          padding={{ top: 32, bottom: 56, left: 56, right: 24 }}
          domainPadding={{ x: breakdownType === 'year' ? 4 : 24, y: [0, 12] }}
          width={chartWidth}
        >
          <VictoryAxis
            style={{
              axis: { stroke: palette.border },
              tickLabels: { fill: palette.icon, fontSize: 12, padding: breakdownType === 'year' ? 20 : 12, angle: breakdownType === 'year' ? 30 : 0 },
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
            data={chartData}
            barWidth={breakdownType === 'month' ? 20 : breakdownType === 'year' ? 12 : 24}
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
      <View style={statisticsStyles.barSummaryRow}>
        {summaryBlocks.map((block, index) => (
          <View key={index} style={statisticsStyles.barSummaryBlock}>
            <ThemedText style={[statisticsStyles.summaryLabel, { color: palette.icon }]}>{block.label}</ThemedText>
            <ThemedText style={[statisticsStyles.summaryValue, { color: palette.text }]}>{block.value}</ThemedText>
          </View>
        ))}
      </View>
    </ThemedView>
  );
};