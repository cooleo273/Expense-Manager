import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, View } from 'react-native';
import { VictoryAxis, VictoryBar, VictoryChart } from 'victory-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import type { DatePreset } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { statisticsStyles } from '@/styles/statistics.styles';
import { formatCompactCurrency } from '@/utils/currency';
import { endOfDay, getCurrentMonthRange, getCurrentWeekRange, getCurrentYearRange, normalizeRange, startOfDay } from '@/utils/date';

const YEAR_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const formatRangeLabel = (start: Date, end: Date) => {
  const sameDay = startOfDay(start).getTime() === startOfDay(end).getTime();
  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (sameDay) {
    return startLabel;
  }
  const sameMonthAndYear = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  if (sameMonthAndYear) {
    return `${startLabel}-${end.getDate()}`;
  }
  const includeStartYear = start.getFullYear() !== end.getFullYear();
  const formattedStart = includeStartYear
    ? start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : startLabel;
  const formattedEnd = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${formattedStart} - ${formattedEnd}`;
};

type DateRange = {
  start: Date;
  end: Date;
};

type Transaction = {
  date: Date;
  type: 'expense' | 'income';
  amount: number;
};

type BreakdownType = 'week' | 'month' | 'year' | 'custom' | 'all';

interface BreakdownChartProps {
  transactions: Transaction[];
  selectedType: 'expense' | 'income';
  dateRange: DateRange | null;
  datePreset?: DatePreset | null;
}

const isThisWeek = (range: DateRange) => {
  const normalized = normalizeRange(range);
  const current = getCurrentWeekRange();
  return (
    normalized.start.getTime() === current.start.getTime() &&
    startOfDay(normalized.end).getTime() === startOfDay(current.end).getTime()
  );
};

const isAnyMonth = (range: DateRange) => {
  const normalized = normalizeRange(range);
  const monthStart = normalized.start;
  const monthEndStart = startOfDay(normalized.end);
  const sameMonth =
    monthStart.getFullYear() === monthEndStart.getFullYear() &&
    monthStart.getMonth() === monthEndStart.getMonth();
  if (!sameMonth) {
    return false;
  }
  const isStartFirstOfMonth = monthStart.getDate() === 1;
  const lastDay = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const isEndLastOfMonth = monthEndStart.getDate() === lastDay;
  return isStartFirstOfMonth && isEndLastOfMonth;
};

const isThisYear = (range: DateRange) => {
  const normalized = normalizeRange(range);
  const current = getCurrentYearRange();
  const normalizedEnd = startOfDay(normalized.end);
  const currentEnd = startOfDay(current.end);
  return (
    normalized.start.getFullYear() === current.start.getFullYear() &&
    normalizedEnd.getFullYear() === currentEnd.getFullYear()
  );
};

const inferBreakdownFromRange = (dateRange: DateRange | null): BreakdownType => {
  if (!dateRange) {
    return 'all';
  }
  if (isThisWeek(dateRange)) {
    return 'week';
  }
  if (isAnyMonth(dateRange)) {
    return 'month';
  }
  if (isThisYear(dateRange)) {
    return 'year';
  }
  return 'custom';
};

const getBreakdownType = (dateRange: DateRange | null, preset?: DatePreset | null): BreakdownType => {
  const inferred = inferBreakdownFromRange(dateRange);

  if (!preset) {
    return inferred;
  }

  if (preset === 'custom') {
    return 'custom';
  }

  if (!dateRange && preset === 'all') {
    return 'all';
  }

  if (preset === inferred) {
    return inferred;
  }

  return inferred;
};

export const BreakdownChart: React.FC<BreakdownChartProps> = ({
  transactions,
  selectedType,
  dateRange,
  datePreset,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const windowWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(windowWidth - 64, 280);

  const breakdownType = getBreakdownType(dateRange, datePreset ?? undefined);
  const [selectedBar, setSelectedBar] = React.useState<{ label: string; total: number } | null>(null);

  const breakdownData = React.useMemo(() => {
    const normalizedRange = dateRange ? normalizeRange(dateRange) : null;
    const relevantTransactions = transactions.filter((transaction) => transaction.type === selectedType);
    const segments: { label: string; start: Date; end: Date; total: number }[] = [];

    if (breakdownType === 'week') {
      const range = normalizedRange ?? getCurrentWeekRange();
      const rangeStart = startOfDay(range.start);
      const rangeEnd = startOfDay(range.end);
      const totalDays = Math.max(1, Math.round((rangeEnd.getTime() - rangeStart.getTime()) / DAY_IN_MS) + 1);
      const totals = new Array(totalDays).fill(0);

      relevantTransactions.forEach((transaction) => {
        const transactionDate = startOfDay(transaction.date);
        if (transactionDate < rangeStart || transactionDate > rangeEnd) {
          return;
        }
        const dayIndex = Math.floor((transactionDate.getTime() - rangeStart.getTime()) / DAY_IN_MS);
        if (dayIndex >= 0 && dayIndex < totals.length) {
          totals[dayIndex] += Math.abs(transaction.amount);
        }
      });

      for (let index = 0; index < totalDays; index += 1) {
        const dayStart = new Date(rangeStart);
        dayStart.setDate(dayStart.getDate() + index);
        const dayEnd = endOfDay(dayStart);
        segments.push({
          label: formatRangeLabel(dayStart, dayStart),
          start: dayStart,
          end: dayEnd,
          total: totals[index],
        });
      }

      return { segments };
    }

    if (breakdownType === 'month') {
      const range = normalizedRange ?? getCurrentMonthRange();
      const rangeStart = startOfDay(range.start);
      const rangeEnd = startOfDay(range.end);
      const totalDays = Math.max(1, Math.round((rangeEnd.getTime() - rangeStart.getTime()) / DAY_IN_MS) + 1);
      const weeksInRange = Math.ceil(totalDays / 7);
      const totals = new Array(weeksInRange).fill(0);

      relevantTransactions.forEach((transaction) => {
        const transactionDate = startOfDay(transaction.date);
        if (transactionDate < rangeStart || transactionDate > rangeEnd) {
          return;
        }
        const diffDays = Math.floor((transactionDate.getTime() - rangeStart.getTime()) / DAY_IN_MS);
        const weekIndex = Math.min(Math.floor(diffDays / 7), weeksInRange - 1);
        if (weekIndex >= 0 && weekIndex < totals.length) {
          totals[weekIndex] += Math.abs(transaction.amount);
        }
      });

      for (let index = 0; index < weeksInRange; index += 1) {
        const segmentStart = new Date(rangeStart);
        segmentStart.setDate(segmentStart.getDate() + index * 7);
        const segmentEndDate = new Date(segmentStart);
        segmentEndDate.setDate(segmentEndDate.getDate() + 6);
        if (segmentEndDate > rangeEnd) {
          segmentEndDate.setTime(rangeEnd.getTime());
        }
        segments.push({
          label: formatRangeLabel(segmentStart, segmentEndDate),
          start: startOfDay(segmentStart),
          end: endOfDay(segmentEndDate),
          total: totals[index],
        });
      }

      return { segments };
    }

    if (breakdownType === 'year') {
      const range = normalizedRange ?? getCurrentYearRange();
      const yearStart = startOfDay(range.start);
      const yearEnd = startOfDay(range.end);
      const totals = new Array(12).fill(0);

      relevantTransactions.forEach((transaction) => {
        const transactionDate = startOfDay(transaction.date);
        if (transactionDate < yearStart || transactionDate > yearEnd) {
          return;
        }
        const monthIndex = transactionDate.getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          totals[monthIndex] += Math.abs(transaction.amount);
        }
      });

      const baseYear = yearStart.getFullYear();
      for (let month = 0; month < 12; month += 1) {
        const monthStart = startOfDay(new Date(baseYear, month, 1));
        const monthEndDate = startOfDay(new Date(baseYear, month + 1, 0));
        if (monthEndDate < yearStart || monthStart > yearEnd) {
          continue;
        }
        const clippedStart = monthStart < yearStart ? yearStart : monthStart;
        const clippedEnd = monthEndDate > yearEnd ? yearEnd : monthEndDate;
        segments.push({
          label: YEAR_LABELS[month],
          start: clippedStart,
          end: endOfDay(clippedEnd),
          total: totals[month],
        });
      }

      return { segments };
    }

    if (breakdownType === 'custom') {
      if (!normalizedRange) {
        return { segments: [] };
      }
      const rangeStart = startOfDay(normalizedRange.start);
      const rangeEnd = startOfDay(normalizedRange.end);
      const totalDays = Math.max(1, Math.round((rangeEnd.getTime() - rangeStart.getTime()) / DAY_IN_MS) + 1);
      const segmentCount = Math.min(5, totalDays);
      const segmentLength = Math.max(1, Math.ceil(totalDays / segmentCount));
      const totals = new Array(segmentCount).fill(0);

      relevantTransactions.forEach((transaction) => {
        const transactionDate = startOfDay(transaction.date);
        if (transactionDate < rangeStart || transactionDate > rangeEnd) {
          return;
        }
        const diffDays = Math.floor((transactionDate.getTime() - rangeStart.getTime()) / DAY_IN_MS);
        const index = Math.min(Math.floor(diffDays / segmentLength), segmentCount - 1);
        if (index >= 0 && index < totals.length) {
          totals[index] += Math.abs(transaction.amount);
        }
      });

      for (let index = 0; index < segmentCount; index += 1) {
        const segmentStart = new Date(rangeStart);
        segmentStart.setDate(segmentStart.getDate() + index * segmentLength);
        const segmentEndDate = new Date(segmentStart);
        segmentEndDate.setDate(segmentEndDate.getDate() + segmentLength - 1);
        if (segmentEndDate > rangeEnd) {
          segmentEndDate.setTime(rangeEnd.getTime());
        }
        segments.push({
          label: formatRangeLabel(segmentStart, segmentEndDate),
          start: startOfDay(segmentStart),
          end: endOfDay(segmentEndDate),
          total: totals[index],
        });
      }

      return { segments };
    }

    const totalsByYear = new Map<number, number>();
    relevantTransactions.forEach((transaction) => {
      const transactionDate = startOfDay(transaction.date);
      if (normalizedRange) {
        const rangeStart = startOfDay(normalizedRange.start);
        const rangeEnd = startOfDay(normalizedRange.end);
        if (transactionDate < rangeStart || transactionDate > rangeEnd) {
          return;
        }
      }
      const year = transactionDate.getFullYear();
      totalsByYear.set(year, (totalsByYear.get(year) ?? 0) + Math.abs(transaction.amount));
    });

    const sortedYears = Array.from(totalsByYear.keys()).sort((a, b) => a - b);
    if (sortedYears.length === 0 && normalizedRange) {
      const startYear = startOfDay(normalizedRange.start).getFullYear();
      const endYear = startOfDay(normalizedRange.end).getFullYear();
      for (let year = startYear; year <= endYear; year += 1) {
        sortedYears.push(year);
        totalsByYear.set(year, 0);
      }
    }

    sortedYears.forEach((year) => {
      const segmentStart = startOfDay(new Date(year, 0, 1));
      const segmentEnd = endOfDay(new Date(year, 11, 31));
      segments.push({
        label: year.toString(),
        start: segmentStart,
        end: segmentEnd,
        total: totalsByYear.get(year) ?? 0,
      });
    });

    return { segments };
  }, [transactions, selectedType, dateRange, breakdownType]);

  const segments = breakdownData.segments;
  const amounts = segments.map((segment) => segment.total);
  const labels = segments.map((segment) => segment.label);
  const numPeriods = segments.length;

  const formatAxisValue = (value: number) => formatCompactCurrency(value).replace(/\$/g, '');

  const formatFullCurrency = (value: number) => {
    const sign = value < 0 ? '-' : '';
    const absValue = Math.abs(value);
    const hasFraction = Math.abs(absValue - Math.floor(absValue)) > Number.EPSILON;
    const formatter = absValue < 1 || hasFraction
      ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      : { minimumFractionDigits: 0, maximumFractionDigits: 0 };
    return `${sign}$${absValue.toLocaleString(undefined, formatter)}`;
  };

  const computedBarWidth = segments.length === 0 ? 20 : segments.length > 10 ? 10 : segments.length > 6 ? 16 : 24;
  const tickAngle = breakdownType === 'month'
    ? 45
    : breakdownType === 'year' || breakdownType === 'custom' || segments.length > 6
      ? 30
      : 0;
  const tickPadding = breakdownType === 'month' ? 24 : tickAngle ? 20 : 12;
  const domainPaddingX = segments.length > 10 ? 12 : breakdownType === 'year' ? 8 : 24;
  const bottomPadding = breakdownType === 'month' ? 72 : 56;

  const maxDataValue = amounts.reduce((max, value) => Math.max(max, value), 0);

  const chartData = segments.map((segment) => ({
    x: segment.label,
    y: segment.total,
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
  const peakIndex = amounts.length > 0
    ? amounts.reduce((bestIndex, value, index) => (value > amounts[bestIndex] ? index : bestIndex), 0)
    : -1;

  const periodAverage = total === 0 || numPeriods === 0 ? 0 : Math.round(total / numPeriods);

  React.useEffect(() => {
    setSelectedBar(null);
  }, [breakdownType, selectedType, dateRange, segments.length]);

  let subtitle = '';
  let summaryBlocks: { label: string; value: string }[] = [];

  if (breakdownType === 'week') {
    subtitle = t('weekly_breakdown');
    const weekendTotal = segments.reduce((sum, segment) => {
      const day = segment.start.getDay();
      return day === 0 || day === 6 ? sum + segment.total : sum;
    }, 0);
    const weekendShare = total === 0 ? 0 : Math.round((weekendTotal / total) * 100);
    summaryBlocks = [
      { label: t('total'), value: formatFullCurrency(total) },
      { label: t('peak_day'), value: peakIndex >= 0 ? labels[peakIndex] : '—' },
      { label: t('daily_avg'), value: formatFullCurrency(periodAverage) },
      { label: t('weekend'), value: `${weekendShare}%` },
    ];
  } else if (breakdownType === 'month') {
    subtitle = t('monthly_breakdown');
    summaryBlocks = [
      { label: t('total'), value: formatFullCurrency(total) },
      { label: t('peak_span'), value: peakIndex >= 0 ? labels[peakIndex] : '—' },
      { label: t('weekly_avg'), value: formatFullCurrency(periodAverage) },
      { label: t('weeks_active'), value: amounts.filter((value) => value > 0).length.toString() },
    ];
  } else if (breakdownType === 'year') {
    subtitle = t('yearly_breakdown');
    const quarterlyTotals = [
      amounts.slice(0, 3).reduce((sum, value) => sum + value, 0),
      amounts.slice(3, 6).reduce((sum, value) => sum + value, 0),
      amounts.slice(6, 9).reduce((sum, value) => sum + value, 0),
      amounts.slice(9, 12).reduce((sum, value) => sum + value, 0),
    ];
    const peakQuarter = quarterlyTotals.indexOf(Math.max(...quarterlyTotals)) + 1;
    summaryBlocks = [
      { label: t('total'), value: formatFullCurrency(total) },
      { label: t('peak_month'), value: peakIndex >= 0 ? labels[peakIndex] : '—' },
      { label: t('monthly_avg'), value: formatFullCurrency(periodAverage) },
      { label: t('peak_quarter'), value: `Q${peakQuarter}` },
    ];
  } else if (breakdownType === 'custom') {
    subtitle = t('custom_breakdown');
    summaryBlocks = [
      { label: t('total'), value: formatFullCurrency(total) },
      { label: t('peak_span'), value: peakIndex >= 0 ? labels[peakIndex] : '—' },
      { label: t('segment_avg'), value: formatFullCurrency(periodAverage) },
      { label: t('segments'), value: numPeriods.toString() },
    ];
  } else if (breakdownType === 'all') {
    subtitle = t('all_time_breakdown');
    summaryBlocks = [
      { label: t('total'), value: formatFullCurrency(total) },
      { label: t('peak_year'), value: peakIndex >= 0 ? labels[peakIndex] : '—' },
      { label: t('yearly_avg'), value: formatFullCurrency(periodAverage) },
      { label: t('years_active'), value: amounts.filter((value) => value > 0).length.toString() },
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
          {selectedType === 'income' ? t('income_overview') : t('expense_overview')}
        </ThemedText>
      </View>
      <View style={[statisticsStyles.chart, { width: chartWidth }]}>
        <VictoryChart
          animate={{ duration: 600 }}
          height={240}
          padding={{ top: 32, bottom: bottomPadding, left: 44, right: 24 }}
          domainPadding={{ x: domainPaddingX, y: [0, 12] }}
          width={chartWidth}
        >
          <VictoryAxis
            style={{
              axis: { stroke: palette.border },
              tickLabels: { fill: palette.icon, fontSize: 12, padding: tickPadding, angle: tickAngle },
              ticks: { stroke: palette.border },
            }}
          />
          <VictoryAxis
            dependentAxis
            tickValues={yAxisTickValues}
            tickFormat={(value: number) => formatAxisValue(value)}
            style={{
              axis: { stroke: palette.border },
              grid: { stroke: palette.border, strokeDasharray: '4,4' },
              tickLabels: { fill: palette.icon, fontSize: 12, padding: 8 },
              ticks: { stroke: palette.border },
            }}
          />
          <VictoryBar
            data={chartData}
            barWidth={computedBarWidth}
            cornerRadius={{ top: 8, bottom: 8 }}
            style={{ data: { fill: palette.tint } }}
            events={[
              {
                target: 'data',
                eventHandlers: {
                  onPressIn: (_, props) => {
                    const datum = props.datum as { x: string | number; y: number };
                    setSelectedBar({
                      label: typeof datum.x === 'string' ? datum.x : `${datum.x}`,
                      total: datum.y,
                    });
                    return undefined;
                  },
                },
              },
            ]}
          />
        </VictoryChart>
      </View>
      <View style={{ gap: Spacing.xs }}>
        {selectedBar ? (
          <View
            style={[
              statisticsStyles.selectedBarInfo,
              { borderColor: palette.border, backgroundColor: palette.surface },
            ]}
          >
            <ThemedText style={[statisticsStyles.selectedBarLabel, { color: palette.icon }]}>
              {selectedBar.label}
            </ThemedText>
            <ThemedText style={[statisticsStyles.selectedBarValue, { color: palette.text }]}>
              {formatFullCurrency(selectedBar.total)}
            </ThemedText>
          </View>
        ) : (
          <ThemedText style={[statisticsStyles.chartHint, { color: palette.icon }]}>{t('tap_a_bar_to_see_total')}</ThemedText>
        )}
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