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
};

const DEFAULT_OPTIONS: TransactionTypeValue[] = ['expense', 'income', 'all'];

export function TransactionTypeFilter({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  style,
  variant = 'default',
}: TransactionTypeFilterProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  const chips = useMemo(() => {
    return options.filter((option, index) => options.indexOf(option) === index);
  }, [options]);

  return (
    <View style={[styles.row, style]}>
      {chips.map((option) => {
        const isActive = option === value;
        return (
          <TouchableOpacity
            key={option}
            accessibilityRole="button"
            onPress={() => onChange(option)}
            style={[
              styles.chip,
              variant === 'compact' ? styles.compactChip : styles.defaultChip,
              isActive
                ? {
                    backgroundColor: `${palette.tint}18`,
                    borderColor: palette.tint,
                  }
                : { borderColor: palette.border },
            ]}
          >
            <ThemedText
              style={[
                styles.label,
                variant === 'compact' ? styles.compactLabel : undefined,
                { color: isActive ? palette.tint : palette.icon },
              ]}
            >
              {option.toUpperCase()}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  chip: {
    borderWidth: 1,
    borderRadius: BorderRadius.xxl,
  },
  defaultChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  compactChip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold as any,
    letterSpacing: 0.6,
  },
  compactLabel: {
    fontSize: FontSizes.xs,
  },
});
