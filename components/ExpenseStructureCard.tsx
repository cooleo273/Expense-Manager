import React, { ReactNode, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
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
  data,
  totalLabel,
  totalCaption,
  legendVariant = 'simple',
  valueFormatter,
  containerStyle,
  chartSize = 240,
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

  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor: palette.card, borderColor: palette.border, borderWidth: 1 },
        containerStyle,
      ]}
    >
      <View style={styles.header}>
        <ThemedText type="subtitle">{title}</ThemedText>
        {subtitle ? <ThemedText style={[styles.subtitle, { color: palette.icon }]}>{subtitle}</ThemedText> : null}
      </View>

      <View style={styles.contentRow}>
        <View style={[styles.chartWrapper, { width: chartSize, height: chartSize }]}>
          <VictoryPie
            animate={{ duration: 500, easing: 'cubicInOut' }}
            data={pieData}
            width={chartSize}
            height={chartSize}
            innerRadius={Math.max(chartSize * 0.28, 60)}
            padAngle={pieData.length > 1 ? 2 : 0}
            radius={Math.max(chartSize / 2 - 8, 80)}
            startAngle={-90}
            endAngle={270}
            standalone
            labels={({ datum }: { datum: PieDatum }) =>
              showValuesOnChart && datum.segment ? formatValue(datum.y, datum.segment) : ''
            }
            labelComponent={
              <VictoryLabel
                style={{ fill: palette.icon, fontSize: 12, fontWeight: '600' }}
                textAnchor="middle"
              />
            }
            labelRadius={Math.max(chartSize * 0.36, 72)}
            style={{
              data: { fill: ({ datum }) => datum.color },
              labels: { padding: 4 },
            }}
          />
          {(totalLabel || totalCaption) && (
            <View style={styles.chartOverlay}>
              <View style={[styles.chartCenter, { backgroundColor: palette.card, borderColor: palette.border }]}>
                {totalLabel ? (
                  <ThemedText style={[styles.centerValue, { color: palette.text }]}>{totalLabel}</ThemedText>
                ) : null}
                {totalCaption ? (
                  <ThemedText style={[styles.centerCaption, { color: palette.icon }]}>{totalCaption}</ThemedText>
                ) : null}
              </View>
            </View>
          )}
        </View>

        <View style={styles.legendContainer}>
          {segments.map((segment) => {
            const percentValue = clampPercent(segment.percent ?? 0);
            const percentLabel = formatPercentLabel(percentValue);
            const formattedValue = valueFormatter
              ? valueFormatter(segment.value, segment)
              : defaultValueFormatter(segment.value);

            return (
              <View key={segment.id} style={styles.legendItem}>
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
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${percentValue}%`, backgroundColor: segment.color },
                          ]}
                        />
                      </View>
                      <ThemedText style={[styles.legendAmount, { color: palette.text }]}>
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
                        <ThemedText style={[styles.simpleValue, { color: palette.text }]}>
                          {formattedValue}
                        </ThemedText>
                      </View>
                      <ThemedText style={[styles.simplePercent, { color: palette.icon }]}>
                        {percentLabel}
                      </ThemedText>
                    </>
                  )}
                </View>
              </View>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
  },
  centerValue: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold as any,
    textAlign: 'center',
  },
  centerCaption: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium as any,
    textAlign: 'center',
  },
  legendContainer: {
    flex: 1,
    minWidth: 160,
    gap: Spacing.md,
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
  simpleValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold as any,
  },
  simplePercent: {
    fontSize: FontSizes.sm,
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
