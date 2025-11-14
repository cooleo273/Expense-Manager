import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type TransactionTypeValue = 'expense' | 'income' | 'all';

type TransactionTypeFilterProps = {
  value: TransactionTypeValue;
  onChange: (value: TransactionTypeValue) => void;
  options?: TransactionTypeValue[];
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'compact';
  labelSize?: 'default' | 'small';
};

const DEFAULT_OPTIONS: TransactionTypeValue[] = ['expense', 'income', 'all'];

export function TransactionTypeFilter({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  style,
  variant = 'default',
  labelSize = 'default',
}: TransactionTypeFilterProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  const chips = useMemo(() => {
    return options.filter((option, index) => options.indexOf(option) === index);
  }, [options]);

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: palette.border,
          backgroundColor: palette.card,
        },
        style,
      ]}
    >
      {chips.map((option, index) => {
        const isActive = option === value;
        const isLast = index === chips.length - 1;
        return (
          <View key={option} style={styles.chipContainer}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => onChange(option)}
              style={[
                styles.chip,
                variant === 'compact' ? styles.compactChip : styles.defaultChip,
                isActive
                  ? { backgroundColor: `${palette.tint}1A` }
                  : { backgroundColor: palette.card },
              ]}
            >
              <ThemedText
                style={[
                  styles.label,
                  variant === 'compact' ? styles.compactLabel : undefined,
                  labelSize === 'small' && styles.smallLabel,
                  { color: isActive ? palette.tint : palette.icon },
                ]}
              >
                {option.toUpperCase()}
              </ThemedText>
            </TouchableOpacity>
            {!isLast && <View style={[styles.separator, { backgroundColor: palette.border }]} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    flexShrink: 0,
  },
  chip: {
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 0,
  },
  defaultChip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  compactChip: {
    paddingVertical: Spacing.tiny,
    paddingHorizontal: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold as any,
    letterSpacing: 0.4,
  },
  compactLabel: {
    fontSize: FontSizes.sm,
  },
  smallLabel: {
    fontSize: FontSizes.xs,
  },
  separator: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
});
