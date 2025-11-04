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
    <View style={[styles.container, { borderColor: palette.border }, style]}>
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
                isActive && { backgroundColor: `${palette.tint}18`, borderRadius: BorderRadius.xxl },
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
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    borderWidth: 0, // Remove individual borders
    borderRadius: 0, // Remove border radius for seamless container
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
  separator: {
    width: 1,
    height: '60%',
  },
});
