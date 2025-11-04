import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExpenseStructureCard } from '@/components/ExpenseStructureCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCategoryColor, getCategoryDefinition, getCategoryIcon, type CategoryKey, type CategoryType } from '@/constants/categories';
import { Colors, IconSizes } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { homeStyles } from '@/styles/home.styles';

type RecordEntry = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  dateLabel: string;
  type: CategoryType;
  date: Date;
  categoryId: CategoryKey;
};

const recordsData: RecordEntry[] = [
  { id: 'rent', title: 'Rent', subtitle: 'RBC Credit Card', amount: -780, dateLabel: 'Yesterday', type: 'expense', date: new Date(2024, 1, 23), categoryId: 'housing' },
  { id: 'salary', title: 'Salary', subtitle: 'RBC Account', amount: 4500, dateLabel: 'Oct 01', type: 'income', date: new Date(2024, 9, 1), categoryId: 'income' },
  { id: 'fuel', title: 'Fuel', subtitle: 'Mastercard', amount: -95.5, dateLabel: 'Sep 30', type: 'expense', date: new Date(2024, 8, 30), categoryId: 'transportation' },
  { id: 'groceries', title: 'Groceries', subtitle: 'Metro Market', amount: -210.99, dateLabel: 'Sep 29', type: 'expense', date: new Date(2024, 8, 29), categoryId: 'groceries' },
  { id: 'bonus', title: 'Quarterly Bonus', subtitle: 'RBC Account', amount: 1250.25, dateLabel: 'Sep 27', type: 'income', date: new Date(2024, 8, 27), categoryId: 'income' },
  { id: 'dining', title: 'Dinner Out', subtitle: 'Visa Infinite', amount: -86.4, dateLabel: 'Sep 25', type: 'expense', date: new Date(2024, 8, 25), categoryId: 'dining' },
  { id: 'insurance', title: 'Auto Insurance', subtitle: 'RBC Account', amount: -220.0, dateLabel: 'Sep 24', type: 'expense', date: new Date(2024, 8, 24), categoryId: 'insurance' },
  { id: 'freelance', title: 'Freelance', subtitle: 'PayPal', amount: 780.0, dateLabel: 'Sep 22', type: 'income', date: new Date(2024, 8, 22), categoryId: 'income' },
  { id: 'gym', title: 'Gym Membership', subtitle: 'Amex Platinum', amount: -55.0, dateLabel: 'Sep 20', type: 'expense', date: new Date(2024, 8, 20), categoryId: 'health' },
  { id: 'investment', title: 'ETF Dividend', subtitle: 'Questrade', amount: 160.75, dateLabel: 'Sep 18', type: 'income', date: new Date(2024, 8, 18), categoryId: 'income' },
  { id: 'streaming', title: 'Streaming Services', subtitle: 'Visa Infinite', amount: -32.99, dateLabel: 'Sep 16', type: 'expense', date: new Date(2024, 8, 16), categoryId: 'entertainment' },
  { id: 'utilities', title: 'Utilities', subtitle: 'Hydro One', amount: -128.5, dateLabel: 'Sep 14', type: 'expense', date: new Date(2024, 8, 14), categoryId: 'utilities' },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { filters } = useFilterContext();
  const tabBarHeight = useBottomTabBarHeight();
  const [showOverlay, setShowOverlay] = useState(false);

  const formatCurrency = (value: number) => {
    const amount = Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `$${amount}`;
  };

  const formatWithSign = (value: number) => (value < 0 ? `-${formatCurrency(value)}` : formatCurrency(value));

  const overallIncome = recordsData.reduce((sum, record) => {
    if (record.type === 'income') {
      return sum + record.amount;
    }
    return sum;
  }, 0);

  const overallExpenses = recordsData.reduce((sum, record) => {
    if (record.type === 'expense') {
      return sum + Math.abs(record.amount);
    }
    return sum;
  }, 0);

  const netBalance = overallIncome - overallExpenses;

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

  const expenseSegments = useMemo(() => {
    const totals = new Map<CategoryKey, number>();

    filteredRecords.forEach((record) => {
      if (record.type !== 'expense') {
        return;
      }
      const amount = Math.abs(record.amount);
      totals.set(record.categoryId, (totals.get(record.categoryId) ?? 0) + amount);
    });

    return Array.from(totals.entries())
      .map(([categoryId, value]) => {
        const category = getCategoryDefinition(categoryId);
        return {
          id: categoryId,
          label: category?.name ?? categoryId,
          value,
          color: getCategoryColor(categoryId, palette.tint),
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredRecords, palette.tint]);

  const expenseStructureTotal = useMemo(
    () => expenseSegments.reduce((sum, segment) => sum + segment.value, 0),
    [expenseSegments],
  );

  const displayedRecords = filteredRecords.slice(0, 10);


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
              <ThemedText adjustsFontSizeToFit numberOfLines={1} style={[styles.balanceValue, { color: palette.text }]}>
                {formatWithSign(netBalance)}
              </ThemedText>
            </View>
            <View style={styles.leftSide}>
              <View style={styles.metaPill}>
                <MaterialCommunityIcons name="chevron-up" size={IconSizes.lg} color={palette.success} />
                <ThemedText adjustsFontSizeToFit numberOfLines={1} style={[styles.metaValue, { color: palette.success }]}>
                  {formatCurrency(overallIncome)}
                </ThemedText>
              </View>
              <View style={styles.metaPill}>
                <MaterialCommunityIcons name="chevron-down" size={IconSizes.lg} color={palette.error} />
                <ThemedText adjustsFontSizeToFit numberOfLines={1} style={[styles.metaValue, { color: palette.error }]}>
                  {formatCurrency(overallExpenses)}
                </ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>

        <ExpenseStructureCard
          title="Expense Structure"
          data={expenseSegments}
          totalLabel={formatCurrency(expenseStructureTotal)}
          totalCaption="Total expenses"
          legendVariant="simple"
          valueFormatter={formatCurrency}
          footerSeparator
          footer={(
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
          )}
        />

        <ThemedView style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Records</ThemedText>
            <ThemedText style={{ color: palette.icon }}>{displayedRecords.length} of {filteredRecords.length} shown</ThemedText>
          </View>
          {displayedRecords.map((record) => {
            const category = getCategoryDefinition(record.categoryId);
            const categoryColor = getCategoryColor(record.categoryId, palette.tint);
            const iconName = getCategoryIcon(record.categoryId, record.type === 'income' ? 'wallet-plus' : 'shape-outline');
            const isIncome = category?.type === 'income' || record.type === 'income';

            return (
              <View key={record.id} style={styles.recordRow}>
                <View style={[styles.recordIcon, { backgroundColor: `${categoryColor}20` }]}
                >
                  <MaterialCommunityIcons
                    name={iconName}
                    size={20}
                    color={categoryColor}
                  />
                </View>
                <View style={styles.recordContent}>
                  <ThemedText style={styles.recordTitle}>{record.title}</ThemedText>
                  <ThemedText style={[styles.recordSubtitle, { color: palette.icon }]}>{record.subtitle}</ThemedText>
                </View>
                <View style={styles.recordMeta}>
                  <ThemedText adjustsFontSizeToFit numberOfLines={1} style={[styles.recordAmount, { color: categoryColor }]}>
                    {isIncome ? '+' : '-'}{formatCurrency(record.amount)}
                  </ThemedText>
                  <ThemedText style={{ color: palette.icon, textAlign: 'right' }}>{record.dateLabel}</ThemedText>
                </View>
              </View>
            );
          })}

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