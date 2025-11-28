import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import type { FABGroupProps } from 'react-native-paper';
import { FAB, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExpenseStructureCard } from '@/components/ExpenseStructureCard';
import { InfoTooltip } from '@/components/InfoTooltip';
import RecordList from '@/components/RecordList';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCategoryColor, getCategoryDefinition, type CategoryKey } from '@/constants/categories';
import { mockRecordsData, resolveAccountId } from '@/constants/mock-data';
import { Colors, IconSizes, Spacing } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Transaction } from '@/services/storage';
import { homeStyles } from '@/styles/home.styles';
import { StorageService } from '../../services/storage';

import { formatCompactCurrency } from '@/utils/currency';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { filters } = useFilterContext();
  const tabBarHeight = useBottomTabBarHeight();
  const [fabOpen, setFabOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const isFocused = useIsFocused();
  const windowDimensions = useWindowDimensions();
  const shouldUseCompactValues = windowDimensions.width <= 360;

  const loadTransactions = useCallback(async () => {
    try {
      const data = await StorageService.getTransactions();
      const transactionsToUse = data.length > 0 ? data : mockRecordsData;
      type UiTransaction = Transaction & { subtitle?: string; date: Date; dateLabel?: string };
      const transformedData = (transactionsToUse as any[]).map((transaction: any) => {
        const subtitle = transaction.subtitle
          ? transaction.subtitle
          : `${transaction.categoryId}${transaction.subcategoryId ? ` - ${transaction.subcategoryId}` : ''}`;
        const dateValue = transaction.date instanceof Date ? transaction.date : new Date(transaction.date);
        return {
          ...(transaction as UiTransaction),
          accountId: resolveAccountId(transaction.accountId, transaction.account),
          subtitle,
          date: dateValue,
        } as UiTransaction;
      });
      setTransactions(transformedData);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      const transformedData = mockRecordsData.map((transaction: any) => ({
        ...transaction,
        accountId: resolveAccountId(transaction.accountId, transaction.account),
        date: transaction.date instanceof Date ? transaction.date : new Date(transaction.date),
        subtitle: transaction.subtitle
          ? transaction.subtitle
          : `${transaction.categoryId}${transaction.subcategoryId ? ` - ${transaction.subcategoryId}` : ''}`,
      }));
      setTransactions(transformedData);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  useEffect(() => {
    if (!isFocused) {
      setFabOpen(false);
    }
  }, [isFocused]);

  const handleFabNavigate = useCallback(
    (path: Parameters<typeof router.push>[0]) => {
      setFabOpen(false);
      router.push(path as Parameters<typeof router.push>[0]);
    },
    [router]
  );

  const fabActions = useMemo<FABGroupProps['actions']>(
    () => [
      {
        icon: 'camera',
        label: 'Scan Receipt',
        labelTextColor: '#FFFFFF',
        color: palette.accent,
        style: { backgroundColor: palette.card, borderRadius: 28 },
        onPress: () => handleFabNavigate('/scan'),
        small: true,
      },
      {
        icon: 'plus',
        label: 'Add Record',
        labelTextColor: '#FFFFFF',
        color: '#FFFFFF',
        style: { backgroundColor: palette.tint, transform: [{ scale: 1.1 }], borderRadius: 28 },
        onPress: () => handleFabNavigate('/log-expenses'),
        small: false,
      },
    ],
    [handleFabNavigate, palette]
  );

  const formatCurrency = (value: number) => {
    const amount = Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `$${amount}`;
  };

  const formatWithSign = (value: number) => (value < 0 ? `-${formatCurrency(value)}` : formatCurrency(value));

  const shouldCompactValue = useCallback(
    (value: number) => {
      const absValue = Math.abs(value);
      if (absValue >= 1_000_000) {
        return true;
      }
      return shouldUseCompactValues && absValue >= 1000;
    },
    [shouldUseCompactValues],
  );

  const matchesLabelsSearch = (labels: string[] | string | undefined, search: string) => {
    if (!labels) {
      return false;
    }
    if (Array.isArray(labels)) {
      return labels.some((label) => label.toLowerCase().includes(search));
    }
    return labels.toLowerCase().includes(search);
  };

  const accountFilteredRecords = useMemo(() => {
    if (!filters.selectedAccount || filters.selectedAccount === 'all') {
      return transactions;
    }
    return transactions.filter((record) => record.accountId === filters.selectedAccount);
  }, [filters.selectedAccount, transactions]);

  const filteredRecords = useMemo(() => {
    return accountFilteredRecords.filter((record) => {
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        if (!record.title.toLowerCase().includes(search) &&
          !record.subtitle.toLowerCase().includes(search) &&
          !(record.payee && record.payee.toLowerCase().includes(search)) &&
          !(record.note && record.note.toLowerCase().includes(search)) &&
          !matchesLabelsSearch(record.labels, search)) {
          return false;
        }
      }

      if (filters.dateRange) {
        if (record.date < filters.dateRange.start || record.date > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [accountFilteredRecords, filters]);

  const overallIncome = accountFilteredRecords.reduce((sum, record) => {
    if (record.type === 'income') {
      return sum + record.amount;
    }
    return sum;
  }, 0);

  const overallExpenses = accountFilteredRecords.reduce((sum, record) => {
    if (record.type === 'expense') {
      return sum + Math.abs(record.amount);
    }
    return sum;
  }, 0);

  const netBalance = overallIncome - overallExpenses;

  const netBalanceDisplay = shouldCompactValue(netBalance) ? formatCompactCurrency(netBalance) : formatWithSign(netBalance);
  const netBalanceFull = formatWithSign(netBalance);
  const overallIncomeDisplay = shouldCompactValue(overallIncome)
    ? formatCompactCurrency(overallIncome)
    : formatCurrency(overallIncome);
  const overallIncomeFull = formatCurrency(overallIncome);
  const overallExpensesDisplay = shouldCompactValue(overallExpenses)
    ? formatCompactCurrency(overallExpenses)
    : formatCurrency(overallExpenses);
  const overallExpensesFull = formatCurrency(overallExpenses);

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
  const expenseStructureTotalLabel = shouldCompactValue(expenseStructureTotal)
    ? formatCompactCurrency(expenseStructureTotal)
    : formatCurrency(expenseStructureTotal);

  const displayedRecords = filteredRecords.slice(0, 10);

  const { periodComparisonLabel } = useMemo(() => {
    if (!accountFilteredRecords.length) {
      return { periodComparisonLabel: 'No data for selected period' };
    }

    const DAY_IN_MS = 24 * 60 * 60 * 1000;
    const range = filters.dateRange;
    const periodEnd = range ? range.end : new Date();
    const rawStart = range ? range.start : new Date(periodEnd.getTime() - 30 * DAY_IN_MS);
    const periodStart = rawStart <= periodEnd ? rawStart : periodEnd;
    const durationMs = Math.max(DAY_IN_MS, periodEnd.getTime() - periodStart.getTime() || DAY_IN_MS);
    const previousEnd = new Date(periodStart.getTime());
    previousEnd.setMilliseconds(previousEnd.getMilliseconds() - 1);
    const previousStart = new Date(previousEnd.getTime() - durationMs);

    const sumExpensesBetween = (recordsArray: typeof accountFilteredRecords, start: Date, end: Date) => {
      return recordsArray.reduce((total, record) => {
        if (record.type !== 'expense') {
          return total;
        }
        const recordDate = record.date instanceof Date ? record.date : new Date(record.date);
        if (recordDate >= start && recordDate <= end) {
          return total + Math.abs(record.amount);
        }
        return total;
      }, 0);
    };

    const currentTotal = sumExpensesBetween(accountFilteredRecords, periodStart, periodEnd);
    const previousTotal = sumExpensesBetween(accountFilteredRecords, previousStart, previousEnd);

    if (previousTotal === 0) {
      if (currentTotal === 0) {
        return { periodComparisonLabel: '0% vs previous period' };
      }
      return { periodComparisonLabel: '' };
    }

    const changePercent = ((currentTotal - previousTotal) / previousTotal) * 100;
    const formattedChange = `${changePercent >= 0 ? '+' : ''}${Math.round(changePercent)}% vs previous period`;
    return { periodComparisonLabel: formattedChange };
  }, [accountFilteredRecords, filters.dateRange]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { backgroundColor: palette.background, paddingBottom: tabBarHeight + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={[styles.balanceCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.balanceContent}>
            <View style={styles.leftSide}>
              <ThemedText style={styles.balanceLabel}>Balance</ThemedText>
              <View style={styles.balanceValueRow}>
                <ThemedText adjustsFontSizeToFit numberOfLines={1} style={[styles.balanceValue, { color: palette.text }]}>
                  {netBalanceDisplay}
                </ThemedText>
                {netBalanceDisplay !== netBalanceFull ? (
                  <InfoTooltip
                    content={netBalanceFull}
                    size={18}
                    iconColor={palette.icon}
                    testID="balance-value-tooltip"
                  />
                ) : null}
              </View>
            </View>
            <View style={styles.leftSide}>
              <View style={styles.metaPill}>
                <MaterialCommunityIcons name="chevron-up" size={IconSizes.lg} color={palette.success} />
                <View style={styles.metaValueRow}>
                  <ThemedText adjustsFontSizeToFit numberOfLines={1} style={[styles.metaValue, { color: palette.success }]}>
                    {overallIncomeDisplay}
                  </ThemedText>
                  {overallIncomeDisplay !== overallIncomeFull ? (
                    <InfoTooltip
                      content={overallIncomeFull}
                      size={16}
                      iconColor={palette.icon}
                      testID="income-value-tooltip"
                    />
                  ) : null}
                </View>
              </View>
              <View style={styles.metaPill}>
                <MaterialCommunityIcons name="chevron-down" size={IconSizes.lg} color={palette.error} />
                <View style={styles.metaValueRow}>
                  <ThemedText adjustsFontSizeToFit numberOfLines={1} style={[styles.metaValue, { color: palette.error }]}>
                    {overallExpensesDisplay}
                  </ThemedText>
                  {overallExpensesDisplay !== overallExpensesFull ? (
                    <InfoTooltip
                      content={overallExpensesFull}
                      size={16}
                      iconColor={palette.icon}
                      testID="expenses-value-tooltip"
                    />
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        </ThemedView>

        <ExpenseStructureCard
          title="Expense Structure"
          data={expenseSegments}
          totalLabel={expenseStructureTotalLabel}
          totalCaption="Total expenses"
          legendVariant="simple"
          maxLegendItems={5}
          valueFormatter={(value: number) => (shouldCompactValue(value) ? formatCompactCurrency(value) : formatCurrency(value))}
          fullValueFormatter={(value: number) => formatCurrency(value)}
          footerSeparator
          footer={(
            <View style={styles.bottomSection}>
              <ThemedText style={{ color: palette.icon }}>{periodComparisonLabel}</ThemedText>
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
            <ThemedText style={{ color: palette.icon }}>
              {displayedRecords.length} of {filteredRecords.length.toLocaleString()} shown
            </ThemedText>
          </View>
          <RecordList
            records={filteredRecords}
            limit={10}
            variant="home"
            formatCurrency={(value: number) => formatCurrency(value)}
            onPressItem={(item: any) => {
              const occurredAt = item.date instanceof Date
                ? item.date.toISOString()
                : new Date(item.date).toISOString();
              const payload = { ...item, occurredAt };
              router.push({
                pathname: '/record-detail',
                params: {
                  id: item.id,
                  payload: encodeURIComponent(JSON.stringify(payload)),
                  type: item.type,
                },
              });
            }}
          />

          <Pressable
            onPress={() => router.push('/records')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}
          >
            <ThemedText style={{ color: palette.tint, fontWeight: '600' }}>Show more</ThemedText>
            <MaterialCommunityIcons name="chevron-right" size={16} color={palette.tint} accessibilityHint={undefined} />
          </Pressable>
        </ThemedView>
      </ScrollView>
      {isFocused && (
        <Portal>
          {fabOpen && <Pressable style={styles.fabBackdrop} onPress={() => setFabOpen(false)} />}
          <FAB.Group
            open={fabOpen}
            visible
            icon={fabOpen ? 'close' : 'plus'}
            actions={fabActions}
            onStateChange={({ open }) => setFabOpen(open)}
            fabStyle={[styles.fabMain, { backgroundColor: palette.tint }]}
            backdropColor="transparent"
            color="white"
            style={[styles.fabGroupContainer, { bottom: tabBarHeight + Spacing.md }]}
          />
        </Portal>
      )}
    </SafeAreaView>
  );
}

const styles = homeStyles;