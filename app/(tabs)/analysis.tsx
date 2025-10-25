import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const spendingForecast = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [310, 285, 420, 380, 450, 395, 360],
      color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
      strokeWidth: 3,
    },
    {
      data: [290, 270, 320, 300, 340, 315, 310],
      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
      strokeWidth: 3,
    },
  ],
  legend: ['Projected', 'Last Week'],
};

const monthComparison = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  datasets: [
    {
      data: [4800, 4300, 4100, 3900],
    },
  ],
};

const categoryBreakdown = [
  { name: 'Bills & Utilities', percent: 27, amount: 7030, color: '#F97316' },
  { name: 'Groceries', percent: 27, amount: 7020, color: '#22D3EE' },
  { name: 'Shopping', percent: 13, amount: 3375, color: '#6366F1' },
  { name: 'Entertainment', percent: 8, amount: 2075, color: '#10B981' },
  { name: 'Education', percent: 6, amount: 1580, color: '#F59E0B' },
  { name: 'Travel', percent: 5, amount: 1210, color: '#EC4899' },
];

export default function Analysis() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const windowWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(windowWidth - 64, 260);
  const [comparePreviousYear, setComparePreviousYear] = useState(true);

  // Chart configuration mimics the polished cards from the design reference.
  const chartConfig = {
    backgroundColor: palette.card,
    backgroundGradientFrom: palette.card,
    backgroundGradientTo: palette.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: palette.background,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: palette.border,
    },
    barPercentage: 0.6,
  } as const;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: palette.background }]}
        showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Spending Insights</ThemedText>
          <ThemedText style={{ color: palette.icon }}>Forecast for February 2024</ThemedText>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}> 
          <View style={styles.cardHeader}>
            <ThemedText type="subtitle">Weekly Forecast</ThemedText>
            <ThemedText style={{ color: palette.icon }}>Last updated 2h ago</ThemedText>
          </View>
          <LineChart
            data={spendingForecast}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
          <View style={styles.legendRow}>
            {spendingForecast.legend.map((label, index) => (
              <View key={label} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendSwatch,
                    {
                      backgroundColor:
                        spendingForecast.datasets[index].color?.(1) ?? palette.tint,
                    },
                  ]}
                />
                <ThemedText style={{ color: palette.text }}>{label}</ThemedText>
              </View>
            ))}
          </View>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}> 
          <View style={styles.cardHeader}>
            <ThemedText type="subtitle">Monthly Comparison</ThemedText>
            <ThemedText style={{ color: palette.icon }}>Average spend ₹3,704</ThemedText>
          </View>
          <BarChart
            data={monthComparison}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            fromZero
            yAxisLabel=""
            yAxisSuffix=""
            style={styles.chart}
          />
          <View style={styles.compareRow}>
            <View style={styles.compareLabel}>
              <MaterialCommunityIcons name="timeline-clock-outline" size={18} color={palette.tint} />
              <ThemedText>Compare with 2023</ThemedText>
            </View>
            <Switch
              value={comparePreviousYear}
              onValueChange={setComparePreviousYear}
              trackColor={{ false: palette.border, true: palette.tint }}
              thumbColor={palette.background}
            />
          </View>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}> 
          <View style={styles.cardHeader}>
            <ThemedText type="subtitle">Category Breakdown</ThemedText>
            <ThemedText style={{ color: palette.icon }}>Track where your money goes</ThemedText>
          </View>
          {categoryBreakdown.map((category) => (
            <View key={category.name} style={styles.categoryRow}>
              <View style={[styles.categorySwatch, { backgroundColor: category.color }]} />
              <View style={styles.categoryLabel}>
                <ThemedText>{category.name}</ThemedText>
                <ThemedText style={{ color: palette.icon }}>₹{category.amount.toLocaleString()}</ThemedText>
              </View>
              <ThemedText style={{ color: palette.icon }}>{category.percent}%</ThemedText>
            </View>
          ))}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  cardHeader: {
    marginBottom: 12,
  },
  chart: {
    borderRadius: 16,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  compareLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  categorySwatch: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  categoryLabel: {
    flex: 1,
  },
});