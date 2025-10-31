import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

import { homeStyles } from '@/app/styles/home.styles';
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
  const tabBarHeight = useBottomTabBarHeight();
  const chartWidth = Dimensions.get('window').width - 64;
  const [showOverlay, setShowOverlay] = useState(false);
  const donutSize = Math.min(Math.max(chartWidth * 0.36, 140), 220);
  const innerSize = Math.max(donutSize * 0.55, 70);

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
        contentContainerStyle={[styles.content, { backgroundColor: palette.background, paddingBottom: tabBarHeight + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={[styles.balanceCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.balanceContent}>
            <View style={styles.leftSide}>
              <ThemedText style={styles.balanceLabel}>Balance</ThemedText>
              <ThemedText style={[styles.balanceValue, { color: palette.text }]}>$10,280.50</ThemedText>
            </View>
            <View style={styles.leftSide}>
              <View style={styles.metaPill}>
                <MaterialCommunityIcons name="chevron-up" size={18} color={palette.success} />
                <ThemedText style={[styles.metaValue, { color: palette.success }]}>$2,890.00</ThemedText>
              </View>
              <View style={styles.metaPill}>
                <MaterialCommunityIcons name="chevron-down" size={18} color={palette.error} />
                <ThemedText style={[styles.metaValue, { color: palette.error }]}>$1,250.25</ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>

        <ThemedView style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Expense Structure</ThemedText>
          </View>
          <View style={styles.chartRow}>
            <View style={styles.legendContainer}>
              {expenseStructure.map((item) => (
                <View key={item.id} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <View>
                    <ThemedText style={{ fontWeight: '600' }}>{item.label}</ThemedText>
                  </View>
                </View>
              ))}
            </View>
            <View style={[styles.chartContainer, { width: donutSize, height: donutSize }]}>
              <PieChart
                data={chartData}
                width={donutSize}
                height={donutSize}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
                hasLegend={false}
                absolute
              />
              <View style={styles.chartOverlay} pointerEvents="none">
                <View
                  style={[
                    styles.chartCenterCircle,
                    {
                      width: innerSize,
                      height: innerSize,
                      borderRadius: innerSize / 2,
                      backgroundColor: palette.card,
                    },
                  ]}
                >
                  <ThemedText style={[styles.chartCenterValue, { color: palette.text }]}>$1,250.25</ThemedText>
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.separator, { backgroundColor: palette.border }]} />
          <View style={styles.bottomSection}>
            <ThemedText style={{ color: palette.icon }}>+33% vs previous period</ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/statistics')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <ThemedText style={{ color: palette.tint, fontWeight: '600' }}>Show more</ThemedText>
              <MaterialCommunityIcons name="chevron-right" size={16} color={palette.tint} />
            </TouchableOpacity>
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
                  name={record.type === 'income' ? 'wallet-plus' : 'cart-minus'}
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
            onPress={() => router.push('/records')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}
          >
            <ThemedText style={{ color: palette.tint, fontWeight: '600' }}>Show more</ThemedText>
            <MaterialCommunityIcons name="chevron-right" size={16} color={palette.tint} />
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
      <TouchableOpacity style={[styles.fab, { backgroundColor: palette.tint, bottom: tabBarHeight + 20 }]} onPress={() => setShowOverlay(true)}>
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>
      <Modal transparent visible={showOverlay} onRequestClose={() => setShowOverlay(false)}>
        <TouchableOpacity style={styles.overlay} onPress={() => setShowOverlay(false)}>
          <TouchableOpacity
            style={[styles.fabOption, { bottom: tabBarHeight + 80 }]}
            onPress={() => { setShowOverlay(false); router.push('/log-expenses'); }}
          >
            <MaterialCommunityIcons name="plus" size={20} color="white" />
            <ThemedText style={{ color: 'white', fontWeight: '600' }}>Add Record</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fabOption, { bottom: tabBarHeight + 20 }]}
            onPress={() => { setShowOverlay(false); router.push('/scan'); }}
          >
            <MaterialCommunityIcons name="camera" size={20} color="white" />
            <ThemedText style={{ color: 'white', fontWeight: '600' }}>Scan Receipt</ThemedText>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = homeStyles;