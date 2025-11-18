import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useMemo, useState, type ReactNode } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, useWindowDimensions, View, ViewStyle } from 'react-native';
import { VictoryLabel, VictoryPie } from 'victory-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ExpenseStructureSegment = {
  id: string;
  label: string;
  value: number;
  color: string;
  percent?: number;
};

type ExpenseStructureCardProps = {
  title: string;
  subtitle?: string;
  icon?: string;
  data: ExpenseStructureSegment[];
  totalLabel?: string;
  totalCaption?: string;
  legendVariant?: 'simple' | 'detailed';
  valueFormatter?: (value: number, segment: ExpenseStructureSegment) => string;
  containerStyle?: StyleProp<ViewStyle>;
  chartSize?: number;
  footer?: ReactNode;
  footerSeparator?: boolean;
  showValuesOnChart?: boolean;
};

const defaultValueFormatter = (value: number) => value.toLocaleString();
const fallbackValueFormatter: NonNullable<ExpenseStructureCardProps['valueFormatter']> = (value) =>
  defaultValueFormatter(value);

const clampPercent = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
};

const formatPercentLabel = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return '0%';
  }
  if (value >= 10) {
    return `${Math.round(value)}%`;
  }
  return `${value.toFixed(1)}%`;
};

export function ExpenseStructureCard({
  title,
  subtitle,
  icon,
  data,
  totalLabel,
  totalCaption,
  legendVariant = 'simple',
  valueFormatter,
  containerStyle,
  chartSize = 180,
  footer,
  footerSeparator = false,
  showValuesOnChart = false,
}: ExpenseStructureCardProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  const totalValue = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  const formatValue = useMemo(
    () => valueFormatter ?? fallbackValueFormatter,
    [valueFormatter]
  );

  const segments = useMemo(() => {
    return data.map((item) => {
      const derivedPercent = item.percent ?? (totalValue === 0 ? 0 : (item.value / totalValue) * 100);
      return {
        ...item,
        percent: Number.isFinite(derivedPercent) ? derivedPercent : 0,
      };
    });
  }, [data, totalValue]);

  type PieDatum = {
    x: string;
    y: number;
    color: string;
    segment?: ExpenseStructureSegment;
  };

  const pieData = useMemo<PieDatum[]>(() => {
    const positiveSegments = segments.filter((segment) => segment.value > 0);

    if (positiveSegments.length === 0) {
      return [
        {
          x: 'No data',
          y: 1,
          color: palette.border,
        },
      ];
    }

    return positiveSegments.map((segment) => ({
      x: segment.label,
      y: segment.value,
      color: segment.color,
      segment,
    }));
  }, [segments, palette]);

  // Default to 'all' so the center shows total amount on first render
  const [activeSegmentId, setActiveSegmentId] = useState<string | undefined>(() => 'all');

  useEffect(() => {
    // If activeSegmentId is 'all' (special state) keep it — don't overwrite.
    if (activeSegmentId === 'all') {
      return;
    }
    if (!pieData.some((entry) => entry.segment?.id === activeSegmentId)) {
      setActiveSegmentId(pieData[0]?.segment?.id);
    }
  }, [activeSegmentId, pieData]);

  const activeSegment = useMemo(() => {
    if (!activeSegmentId || activeSegmentId === 'all') {
      return undefined;
    }
    return segments.find((segment) => segment.id === activeSegmentId);
  }, [segments, activeSegmentId]);

  const fallbackSegmentForFormatter = useMemo<ExpenseStructureSegment>(() => {
    if (segments[0]) {
      return segments[0];
    }
    return {
      id: 'total',
      label: title,
      value: totalValue,
      color: palette.tint,
    };
  }, [segments, title, totalValue, palette.tint]);

  const formattedTotalValue = useMemo(() => {
    if (totalLabel) {
      return totalLabel;
    }
    return formatValue(totalValue, fallbackSegmentForFormatter);
  }, [formatValue, fallbackSegmentForFormatter, totalLabel, totalValue]);

  const centerValueText = activeSegment
    ? formatValue(activeSegment.value, activeSegment)
    : formattedTotalValue;
  // When all is active, the caption should say ALL and the percent should be unchecked
  const centerCaptionText = activeSegment
    ? activeSegment.label
    : activeSegmentId === 'all'
    ? 'Total Expenses'
    : totalCaption ?? title;
  const centerPercentText = activeSegment ? formatPercentLabel(clampPercent(activeSegment.percent ?? 0)) : undefined;
  // Make small screens adapt by reducing the chart size and switching to vertical layout
  const window = useWindowDimensions();
  const isNarrow = window.width <= 360;
  const effectiveChartSize = Math.min(chartSize, isNarrow ? 120 : chartSize);
  const innerRadius = Math.max(effectiveChartSize * 0.2, 40);
  const outerRadius = Math.max(chartSize / 2 - 8, 80);
  const labelRadius = (innerRadius + outerRadius) / 2;
  const chartCenterBorderColor = activeSegment
    ? `${activeSegment.color}55`
    : activeSegmentId === 'all'
    ? palette.tint
    : palette.border;

  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor: palette.card, borderColor: palette.border, borderWidth: 1 },
        containerStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          {icon && <MaterialCommunityIcons name={icon as any} size={20} color={palette.tint} />}
          <ThemedText type="subtitle">{title}</ThemedText>
        </View>
        {subtitle ? <ThemedText style={[styles.subtitle, { color: palette.icon }]}>{subtitle}</ThemedText> : null}
      </View>

      <View
        style={[
          styles.contentRow,
          isNarrow && { flexDirection: 'column', alignItems: 'center', gap: Spacing.md },
        ]}
      >
        <View style={[styles.chartWrapper, { width: effectiveChartSize, height: effectiveChartSize }]}>
          <VictoryPie
            animate={false}
            data={pieData}
            width={effectiveChartSize}
            height={effectiveChartSize}
            innerRadius={innerRadius}
            padAngle={pieData.length > 1 ? 2 : 0}
            radius={outerRadius}
            startAngle={-90}
            endAngle={270}
            standalone
            labels={({ datum }: { datum: PieDatum }) =>
              showValuesOnChart && datum.segment ? formatPercentLabel(clampPercent(datum.segment.percent ?? 0)) : ''
            }
            labelComponent={
              <VictoryLabel
                style={{ fill: 'white', fontSize: 12, fontWeight: '600' }}
                textAnchor="middle"
              />
            }
            labelRadius={labelRadius}
            style={{
              data: {
                fill: ({ datum }) => datum.color,
                opacity: ({ datum }) =>
                  activeSegmentId === 'all' ? 1 : (datum.segment?.id === activeSegment?.id ? 1 : 0.35),
                stroke: ({ datum }) => (datum.segment?.id === activeSegment?.id ? palette.card : 'transparent'),
                strokeWidth: ({ datum }) => (datum.segment?.id === activeSegment?.id ? 2 : 0),
              },
              labels: { padding: 4 },
            }}
            events={[
              {
                target: 'data',
                eventHandlers: {
                  onPressIn: (_, props) => {
                    const segmentId = props.datum.segment?.id;
                    if (segmentId) {
                      setActiveSegmentId(segmentId);
                    }
                    return undefined;
                  },
                },
              },
            ]}
          />
          {(centerValueText || centerCaptionText || centerPercentText) && (
            <View style={styles.chartOverlay}>
              <View
                style={[
                  styles.chartCenter,
                  {
                    backgroundColor: palette.card,
                    borderColor: chartCenterBorderColor,
                  },
                ]}
              >
                {centerValueText ? (
                  <ThemedText
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={[styles.centerValue, { color: palette.text }]}
                  >
                    {centerValueText}
                  </ThemedText>
                ) : null}
                {centerCaptionText ? (
                  <ThemedText
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={[styles.centerCaption, { color: palette.icon }]}
                  >
                    {centerCaptionText}
                  </ThemedText>
                ) : null}
                {centerPercentText ? (
                  <ThemedText style={[styles.centerPercent, { color: palette.icon }]}>
                    {centerPercentText}
                  </ThemedText>
                ) : null}
              </View>
            </View>
          )}
        </View>

        <View style={[styles.legendContainer, isNarrow && { width: '100%' }]}>
          {[{
            id: 'all',
            label: 'ALL',
            value: totalValue,
            color: palette.tint,
          } as ExpenseStructureSegment, ...segments].map((segment) => {
            const percentValue = clampPercent(segment.percent ?? 0);
            const percentLabel = formatPercentLabel(percentValue);
            const formattedValue = valueFormatter
              ? valueFormatter(segment.value, segment)
              : defaultValueFormatter(segment.value);

            return (
              <TouchableOpacity
                key={segment.id}
                activeOpacity={0.8}
                onPress={() => setActiveSegmentId(segment.id)}
                style={[
                  styles.legendItem,
                  activeSegmentId === segment.id && {
                    backgroundColor: `${segment.color}20`,
                    borderRadius: BorderRadius.md,
                    paddingVertical: Spacing.xs,
                    paddingHorizontal: Spacing.sm,
                  },
                ]}
              >
                <View style={[styles.legendSwatch, { backgroundColor: segment.color }]} />
                <View style={styles.legendContent}>
                  {legendVariant === 'detailed' ? (
                    <>
                      <View style={styles.legendHeaderRow}>
                        <ThemedText
                          style={[styles.legendLabel, { color: palette.text }]}
                          numberOfLines={1}
                        >
                          {segment.label}
                        </ThemedText>
                        <ThemedText style={[styles.legendPercent, { color: palette.icon }]}>{percentLabel}</ThemedText>
                      </View>
                      <View style={[styles.progressTrack, { backgroundColor: palette.muted }]}>
                        <View style={[styles.progressFill, { width: `${percentValue}%`, backgroundColor: segment.color }]} />
                      </View>
                      <ThemedText adjustsFontSizeToFit numberOfLines={1} style={[styles.legendAmount, { color: palette.text }]}>
                        {formattedValue}
                      </ThemedText>
                    </>
                  ) : (
                    <>
                      <View style={styles.legendHeaderRow}>
                        <ThemedText
                          style={[styles.legendLabel, { color: palette.text }]}
                          numberOfLines={1}
                        >
                          {segment.label}
                        </ThemedText>
                      </View>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {footer ? (
        <>
          {footerSeparator ? (
            <View style={[styles.footerSeparator, { backgroundColor: palette.border }]} />
          ) : null}
          {footer}
        </>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  header: {
    gap: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
  },
  contentRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chartOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  chartCenter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
  },
  centerValue: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold as any,
    textAlign: 'center',
  },
  centerCaption: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium as any,
    textAlign: 'center',
  },
  centerPercent: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium as any,
    textAlign: 'center',
  },
  legendContainer: {
    flex: 1,
    gap: Spacing.md,
    // Allow the legend to shrink on small phones / narrow widths so it doesn't overflow
    minWidth: 0,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: BorderRadius.sm,
    marginTop: 2,
  },
  legendContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  legendHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  legendLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold as any,
    flexShrink: 1,
  },
  legendAmount: {
    fontSize: FontSizes.sm,
  },
  legendPercent: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold as any,
  },
  progressTrack: {
    height: 6,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  footerSeparator: {
    height: 1,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
});
