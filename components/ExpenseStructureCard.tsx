import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, TouchableOpacity, useWindowDimensions, View, ViewStyle } from 'react-native';
import { VictoryLabel, VictoryPie } from 'victory-native';

import { InfoTooltip } from '@/components/InfoTooltip';
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
  fullValueFormatter?: (value: number, segment: ExpenseStructureSegment) => string;
  containerStyle?: StyleProp<ViewStyle>;
  chartSize?: number;
  maxLegendItems?: number;
  footer?: ReactNode;
  footerSeparator?: boolean;
  showValuesOnChart?: boolean;
};

const defaultValueFormatter = (value: number) => value.toLocaleString();
const fallbackValueFormatter: NonNullable<ExpenseStructureCardProps['valueFormatter']> = (value) =>
  defaultValueFormatter(value);
const fallbackFullValueFormatter: NonNullable<ExpenseStructureCardProps['fullValueFormatter']> = (value) =>
  defaultValueFormatter(value);

const MARGIN_KEYS = [
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginHorizontal',
  'marginVertical',
  'marginStart',
  'marginEnd',
] as const;

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
  fullValueFormatter,
  containerStyle,
  chartSize = 180,
  maxLegendItems,
  footer,
  footerSeparator = false,
  showValuesOnChart = false,
}: ExpenseStructureCardProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  const flattenedContainerStyle = useMemo<ViewStyle | undefined>(() => {
    if (!containerStyle) {
      return undefined;
    }
    return StyleSheet.flatten(containerStyle) as ViewStyle | undefined;
  }, [containerStyle]);

  const outerContainerStyle = useMemo<ViewStyle | undefined>(() => {
    if (!flattenedContainerStyle) {
      return undefined;
    }
    const style: ViewStyle = {};
    MARGIN_KEYS.forEach((key) => {
      const value = (flattenedContainerStyle as Record<string, any>)[key];
      if (value !== undefined) {
        (style as Record<string, any>)[key] = value;
      }
    });
    return style;
  }, [flattenedContainerStyle]);

  const innerContainerOverrides = useMemo<ViewStyle | undefined>(() => {
    if (!flattenedContainerStyle) {
      return undefined;
    }
    const style = { ...flattenedContainerStyle } as Record<string, any>;
    MARGIN_KEYS.forEach((key) => {
      if (key in style) {
        delete style[key];
      }
    });
    return style as ViewStyle;
  }, [flattenedContainerStyle]);

  const totalValue = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  const formatValue = useMemo(
    () => valueFormatter ?? fallbackValueFormatter,
    [valueFormatter]
  );
  const formatFullValue = useMemo(
    () => fullValueFormatter ?? fallbackFullValueFormatter,
    [fullValueFormatter]
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

  const { displayedSegments, aggregatedPieData } = useMemo(() => {
    if (!maxLegendItems) {
      return { displayedSegments: segments, aggregatedPieData: pieData };
    }
    const totalSlots = maxLegendItems;
    const slotsForCategoriesPlusMaybeOthers = Math.max(0, totalSlots - 1);
    const sorted = [...segments].sort((a, b) => b.value - a.value);

    if (sorted.length <= slotsForCategoriesPlusMaybeOthers) {
      const displayed = sorted.slice(0, slotsForCategoriesPlusMaybeOthers);
      return {
        displayedSegments: displayed,
        aggregatedPieData: displayed.map((segment) => ({ x: segment.label, y: segment.value, color: segment.color, segment })),
      };
    }
    const slotsLeftForTop = Math.max(0, slotsForCategoriesPlusMaybeOthers - 1);
    const top = sorted.slice(0, slotsLeftForTop);
    const rest = sorted.slice(slotsLeftForTop);
    const othersValue = rest.reduce((sum, s) => sum + s.value, 0);
    const othersSegment: ExpenseStructureSegment = {
      id: 'others',
      label: 'Others',
      value: othersValue,
      color: '#000000',
      percent: (othersValue / totalValue) * 100,
    };
    const finalSegments = [...top, othersSegment];
    return {
      displayedSegments: finalSegments,
      aggregatedPieData: finalSegments.map((segment) => ({ x: segment.label, y: segment.value, color: segment.color, segment })),
    };
  }, [segments, maxLegendItems, pieData, totalValue]);

  const [activeSegmentId, setActiveSegmentId] = useState<string | undefined>(() => 'all');

  useEffect(() => {
    if (activeSegmentId === 'all') {
      return;
    }
    if (!aggregatedPieData.some((entry) => entry.segment?.id === activeSegmentId)) {
      setActiveSegmentId(aggregatedPieData[0]?.segment?.id);
    }
  }, [activeSegmentId, aggregatedPieData]);

  const activeSegment = useMemo(() => {
    if (!activeSegmentId || activeSegmentId === 'all') {
      return undefined;
    }
    return displayedSegments.find((segment) => segment.id === activeSegmentId) || segments.find((segment) => segment.id === activeSegmentId);
  }, [segments, displayedSegments, activeSegmentId]);

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
  const totalFullValue = useMemo(
    () => formatFullValue(totalValue, fallbackSegmentForFormatter),
    [formatFullValue, fallbackSegmentForFormatter, totalValue]
  );

  const centerValue = useMemo(() => {
    if (activeSegment) {
      return {
        display: formatValue(activeSegment.value, activeSegment),
        full: formatFullValue(activeSegment.value, activeSegment),
      };
    }
    return {
      display: formattedTotalValue,
      full: totalFullValue,
    };
  }, [activeSegment, formatFullValue, formatValue, formattedTotalValue, totalFullValue]);
  const centerCaptionText = activeSegment
    ? activeSegment.label
    : activeSegmentId === 'all'
      ? totalCaption ?? 'Total Expenses'
      : totalCaption ?? title;
  const centerPercentText = activeSegment ? formatPercentLabel(clampPercent(activeSegment.percent ?? 0)) : undefined;
  const window = useWindowDimensions();
  const isNarrow = window.width <= 360;
  const effectiveChartSize = Math.min(chartSize, isNarrow ? 130 : chartSize);
  const outerRadius = Math.max(effectiveChartSize / 2 - 8, 24);
  const innerRadius = isNarrow ? 20 : Math.max(effectiveChartSize * 0.2, 16);
  const labelRadius = (innerRadius + outerRadius) / 2;
  const centerDiameter = Math.min(Math.max(Math.round(effectiveChartSize * 0.44), 44), effectiveChartSize - 16);
  const chartCenterBorderColor = activeSegment
    ? `${activeSegment.color}55`
    : activeSegmentId === 'all'
      ? palette.tint
      : palette.border;

  const innerContainerStyle = (innerContainerOverrides ?? containerStyle) as StyleProp<ViewStyle> | undefined;
  const rippleColor = `${palette.tint}1A`;

  return (
    <Pressable
      onPress={() => {}}
      android_ripple={{ color: rippleColor, borderless: false }}
      style={({ pressed }) => [
        styles.cardPressable,
        outerContainerStyle ?? null,
        pressed ? styles.cardPressablePressed : null,
      ]}
    >
      {({ pressed }) => (
        <ThemedView
          style={[
            styles.container,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
              borderWidth: 1,
            },
            pressed ? styles.containerPressed : null,
            pressed ? { borderColor: palette.tint } : null,
            innerContainerStyle,
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
          isNarrow && { gap: Spacing.sm },
        ]}
      >
        <View style={[styles.chartWrapper, { width: effectiveChartSize, height: effectiveChartSize }]}>
          <VictoryPie
            animate={false}
            data={aggregatedPieData}
            width={effectiveChartSize}
            height={effectiveChartSize}
            innerRadius={innerRadius}
            padAngle={aggregatedPieData.length > 1 ? 2 : 0}
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
          {(centerValue.display || centerCaptionText || centerPercentText) && (
            <View style={styles.chartOverlay}>
              <View
                style={[
                  styles.chartCenter,
                  {
                    backgroundColor: palette.card,
                    borderColor: chartCenterBorderColor,
                    width: isNarrow ? 60 : 88,
                    height: isNarrow ? 60 : 88,
                    borderRadius: isNarrow ? 30 : 44,
                  },
                ]}
                pointerEvents="auto"
              >
                {centerValue.display ? (
                  <View style={styles.centerValueRow}>
                    <ThemedText
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      style={[styles.centerValue, { color: palette.text, fontSize: isNarrow ? FontSizes.md : FontSizes.lg }]}
                    >
                      {centerValue.display}
                    </ThemedText>
                    {/* {centerValue.display !== centerValue.full ? (
                      <InfoTooltip
                        content={centerValue.full}
                        size={16}
                        iconColor={palette.icon}
                        testID="expense-structure-center-tooltip"
                      />
                    ) : null} */}
                  </View>
                ) : null}
                {centerCaptionText ? (
                  <ThemedText
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={[styles.centerCaption, { color: palette.icon, fontSize: isNarrow ? FontSizes.xs : FontSizes.sm }]}
                  >
                    {centerCaptionText}
                  </ThemedText>
                ) : null}
                {centerPercentText ? (
                  <ThemedText style={[styles.centerPercent, { color: palette.icon, fontSize: isNarrow ? 10 : FontSizes.xs }]}>
                    {centerPercentText}
                  </ThemedText>
                ) : null}
              </View>
            </View>
          )}
        </View>

        <View style={[styles.legendContainer]}>
          {[{
            id: 'all',
            label: 'ALL',
            value: totalValue,
            color: '#FFFFFF',
          } as ExpenseStructureSegment, ...displayedSegments].map((segment) => {
            const percentValue = clampPercent(segment.percent ?? 0);
            const percentLabel = formatPercentLabel(percentValue);
            const formattedValue = formatValue(segment.value, segment);
            const fullValue = formatFullValue(segment.value, segment);
            const showTooltip = formattedValue !== fullValue;

            return (
              <TouchableOpacity
                key={segment.id}
                activeOpacity={0.8}
                onPress={(event) => {
                  event.stopPropagation?.();
                  setActiveSegmentId(segment.id);
                }}
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
                <View
                  style={[
                    styles.legendSwatch,
                    segment.id === 'all'
                      ? { backgroundColor: palette.tint }
                      : { backgroundColor: segment.color },
                  ]}
                />
                <View style={styles.legendContent}>
                  {legendVariant === 'detailed' ? (
                    <>
                      <View style={styles.legendHeaderRow}>
                        {segment.id === 'all' ? (
                          <View style={{ backgroundColor: palette.tint, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm }}>
                            <ThemedText style={[styles.legendLabel, { color: '#000000', fontSize: isNarrow ? FontSizes.sm : FontSizes.md }]} numberOfLines={1}>
                              {segment.label}
                            </ThemedText>
                          </View>
                        ) : (
                          <ThemedText
                            style={[styles.legendLabel, { color: '#000000', fontSize: isNarrow ? FontSizes.sm : FontSizes.md }]}
                            numberOfLines={1}
                          >
                            {segment.label}
                          </ThemedText>
                        )}
                        <ThemedText style={[styles.legendPercent, { color: '#000000', fontSize: isNarrow ? FontSizes.xs : FontSizes.sm }]}>{percentLabel}</ThemedText>
                      </View>
                      <View style={[styles.progressTrack, { backgroundColor: palette.muted }]}>
                        <View style={[styles.progressFill, { width: `${percentValue}%`, backgroundColor: segment.color }]} />
                      </View>
                      <View style={styles.legendAmountRow}>
                        <ThemedText
                          adjustsFontSizeToFit
                          numberOfLines={1}
                          style={[styles.legendAmount, { color: '#000000', fontSize: isNarrow ? FontSizes.xs : FontSizes.sm }]}
                        >
                          {formattedValue}
                        </ThemedText>
                        {showTooltip ? (
                          <InfoTooltip
                            content={fullValue}
                            size={16}
                            iconColor={palette.icon}
                            testID={`expense-structure-${segment.id}-tooltip`}
                          />
                        ) : null}
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.legendHeaderRow}>
                        <ThemedText
                          style={[styles.legendLabel, { color: '#000000', fontSize: isNarrow ? FontSizes.sm : FontSizes.md }]}
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
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardPressable: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  cardPressablePressed: {
    transform: [{ scale: 0.995 }],
  },
  containerPressed: {
    shadowColor: 'rgba(15,23,42,0.25)',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
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
    gap: Spacing.md,
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
    pointerEvents: 'box-none',
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
  centerValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
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
  legendAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.tiny,
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
