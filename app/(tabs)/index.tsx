import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

const expenseStructure = [
  { id: 'household', label: 'Household', value: 480, color: '#4F46E5' },
  { id: 'vehicle', label: 'Vehicle', value: 320, color: '#F97316' },
  { id: 'utilities', label: 'Utilities', value: 210, color: '#0EA5E9' },
  { id: 'others', label: 'Others', value: 140, color: '#22C55E' },
];

type RecordEntry = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  dateLabel: string;
  type: 'income' | 'expense';
  date: Date;
};

const recordsData: RecordEntry[] = [
  { id: 'rent', title: 'Rent', subtitle: 'RBC Credit Card', amount: -780, dateLabel: 'Yesterday', type: 'expense', date: new Date(2024, 1, 23) },
  { id: 'salary', title: 'Salary', subtitle: 'RBC Account', amount: 4500, dateLabel: 'Oct 01', type: 'income', date: new Date(2024, 9, 1) },
  { id: 'fuel', title: 'Fuel', subtitle: 'Mastercard', amount: -95.5, dateLabel: 'Sep 30', type: 'expense', date: new Date(2024, 8, 30) },
  { id: 'groceries', title: 'Groceries', subtitle: 'Metro Market', amount: -210.99, dateLabel: 'Sep 29', type: 'expense', date: new Date(2024, 8, 29) },
  { id: 'bonus', title: 'Quarterly Bonus', subtitle: 'RBC Account', amount: 1250.25, dateLabel: 'Sep 27', type: 'income', date: new Date(2024, 8, 27) },
  { id: 'dining', title: 'Dinner Out', subtitle: 'Visa Infinite', amount: -86.4, dateLabel: 'Sep 25', type: 'expense', date: new Date(2024, 8, 25) },
  { id: 'insurance', title: 'Auto Insurance', subtitle: 'RBC Account', amount: -220.0, dateLabel: 'Sep 24', type: 'expense', date: new Date(2024, 8, 24) },
  { id: 'freelance', title: 'Freelance', subtitle: 'PayPal', amount: 780.0, dateLabel: 'Sep 22', type: 'income', date: new Date(2024, 8, 22) },
  { id: 'gym', title: 'Gym Membership', subtitle: 'Amex Platinum', amount: -55.0, dateLabel: 'Sep 20', type: 'expense', date: new Date(2024, 8, 20) },
  { id: 'investment', title: 'ETF Dividend', subtitle: 'Questrade', amount: 160.75, dateLabel: 'Sep 18', type: 'income', date: new Date(2024, 8, 18) },
  { id: 'streaming', title: 'Streaming Services', subtitle: 'Visa Infinite', amount: -32.99, dateLabel: 'Sep 16', type: 'expense', date: new Date(2024, 8, 16) },
  { id: 'utilities', title: 'Utilities', subtitle: 'Hydro One', amount: -128.5, dateLabel: 'Sep 14', type: 'expense', date: new Date(2024, 8, 14) },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { filters } = useFilterContext();
  const chartWidth = Dimensions.get('window').width - 64;

  const formatCurrency = (value: number) => {
    const amount = Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `$${amount}`;
  };

  const filteredRecords = useMemo(() => {
    return recordsData.filter((record) => {
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        if (!record.title.toLowerCase().includes(search) && !record.subtitle.toLowerCase().includes(search)) {
          return false;
        }
      }

      if (filters.searchCategory && filters.searchCategory !== 'all') {
        if (filters.searchCategory === 'income' && record.type !== 'income') {
          return false;
        }
        if (filters.searchCategory === 'expense' && record.type !== 'expense') {
          return false;
        }
      }

      if (filters.dateRange) {
        if (record.date < filters.dateRange.start || record.date > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  const displayedRecords = filteredRecords.slice(0, 10);

  const chartData = useMemo(() => {
    return expenseStructure.map((item) => ({
      name: item.label,
      population: item.value,
      color: item.color,
      legendFontColor: palette.icon,
      legendFontSize: 12,
    }));
  }, [palette.icon]);

  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: palette.card,
      backgroundGradientTo: palette.card,
      color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
      useShadowColorFromDataset: false,
      decimalPlaces: 0,
    }),
    [palette.card]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: palette.background }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={[styles.balanceCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.balanceHeader}>
            <View>
              <ThemedText style={styles.balanceLabel}>Balance</ThemedText>
              <ThemedText style={[styles.balanceValue, { color: palette.text }]}>$10,280.50</ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.balanceIconButton, { borderColor: palette.border }]}
              accessibilityRole="button"
              onPress={() => router.push('/add-account')}
            >
              <MaterialCommunityIcons name="plus" size={20} color={palette.icon} />
            </TouchableOpacity>
          </View>
          <View style={styles.balanceMetaRow}>
            <View style={styles.metaPill}>
              <MaterialCommunityIcons name="trending-up" size={18} color={palette.success} />
              <ThemedText style={[styles.metaValue, { color: palette.success }]}>$2,890.00</ThemedText>
            </View>
            <View style={styles.metaPill}>
              <MaterialCommunityIcons name="trending-down" size={18} color={palette.error} />
              <ThemedText style={[styles.metaValue, { color: palette.error }]}>$1,250.25</ThemedText>
            </View>
          </View>
        </ThemedView>

        <ThemedView style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Expense Structure</ThemedText>
            <ThemedText style={{ color: palette.icon }}>+33% vs previous period</ThemedText>
          </View>
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              width={Math.max(chartWidth, 240)}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              hasLegend={false}
              absolute
            />
            <View style={[styles.chartLabelBadge, { backgroundColor: palette.background }]}
            >
              <ThemedText style={{ fontSize: 20, fontWeight: '700', color: palette.text }}>$1,250.25</ThemedText>
              <ThemedText style={{ color: palette.icon }}>Spent</ThemedText>
            </View>
          </View>
          <View style={styles.legendGrid}>
            {expenseStructure.map((item) => (
              <View key={item.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <View>
                  <ThemedText style={{ fontWeight: '600' }}>{item.label}</ThemedText>
                  <ThemedText style={{ color: palette.icon }}>{formatCurrency(item.value)}</ThemedText>
                </View>
              </View>
            ))}
          </View>
        </ThemedView>

        <ThemedView style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Records</ThemedText>
            <ThemedText style={{ color: palette.icon }}>{displayedRecords.length} of {filteredRecords.length} shown</ThemedText>
          </View>
          {displayedRecords.map((record) => (
            <View key={record.id} style={styles.recordRow}>
              <View style={[styles.recordIcon, { backgroundColor: `${record.type === 'income' ? palette.success : palette.error}12` }]}
              >
                <MaterialCommunityIcons
                  name={record.type === 'income' ? 'arrow-down-left' : 'arrow-up-right'}
                  size={20}
                  color={record.type === 'income' ? palette.success : palette.error}
                />
              </View>
              <View style={styles.recordContent}>
                <ThemedText style={styles.recordTitle}>{record.title}</ThemedText>
                <ThemedText style={[styles.recordSubtitle, { color: palette.icon }]}>{record.subtitle}</ThemedText>
              </View>
              <View style={styles.recordMeta}>
                <ThemedText style={[styles.recordAmount, { color: record.type === 'income' ? palette.success : palette.error }]}>
                  {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount)}
                </ThemedText>
                <ThemedText style={{ color: palette.icon, textAlign: 'right' }}>{record.dateLabel}</ThemedText>
              </View>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => router.push('/transactions')}
            style={[styles.showMoreButton, { borderColor: palette.border }]}
          >
            <ThemedText style={{ color: palette.tint, fontWeight: '600' }}>Show more</ThemedText>
            <MaterialCommunityIcons name="chevron-right" size={20} color={palette.tint} />
          </TouchableOpacity>
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
    gap: 16,
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  balanceIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceMetaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  metaValue: {
    fontWeight: '600',
    fontSize: 15,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartLabelBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 60,
    elevation: 4,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    top: '50%',
    left: '50%',
    transform: [{ translateX: -60 }, { translateY: -40 }],
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '48%',
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 12,
  },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordContent: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  recordSubtitle: {
    marginTop: 2,
    fontSize: 13,
  },
  recordMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  recordAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  showMoreButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});