import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FAB, Portal } from 'react-native-paper';
import type { FABGroupProps } from 'react-native-paper';

import { ExpenseStructureCard } from '@/components/ExpenseStructureCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCategoryColor, getCategoryDefinition, getCategoryIcon, type CategoryKey } from '@/constants/categories';
import { Colors, IconSizes, Spacing } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { homeStyles } from '@/styles/home.styles';
import { formatFriendlyDate } from '@/utils/date';
import { mockRecordsData } from '../../constants/mock-data';
import { StorageService } from '../../services/storage';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { filters } = useFilterContext();
  const tabBarHeight = useBottomTabBarHeight();
  const [fabOpen, setFabOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  const loadTransactions = useCallback(async () => {
    try {
      const data = await StorageService.getTransactions();
      // Use mock data if no real data exists
      const transactionsToUse = data.length > 0 ? data : mockRecordsData;
      // Transform data to match UI expectations
      const transformedData = transactionsToUse.map(transaction => ({
        ...transaction,
        date: new Date(transaction.date), // Convert string to Date
        subtitle: `${transaction.categoryId}${transaction.subcategoryId ? ` - ${transaction.subcategoryId}` : ''}`, // Add subtitle
      }));
      setTransactions(transformedData);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      // Fallback to mock data on error
      const transformedData = mockRecordsData.map(transaction => ({
        ...transaction,
        date: new Date(transaction.date), // Convert string to Date
        subtitle: `${transaction.categoryId}${transaction.subcategoryId ? ` - ${transaction.subcategoryId}` : ''}`, // Add subtitle
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

  const handleFabNavigate = useCallback(
    (path: string) => {
      setFabOpen(false);
      router.push(path);
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

  const filteredRecords = useMemo(() => {
    return transactions.filter((record) => {
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        if (!record.title.toLowerCase().includes(search) && 
            !record.subtitle.toLowerCase().includes(search) &&
            !(record.payee && record.payee.toLowerCase().includes(search)) &&
            !(record.note && record.note.toLowerCase().includes(search)) &&
            !(record.labels && record.labels.toLowerCase().includes(search))) {
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
  }, [filters, transactions]);

  const overallIncome = filteredRecords.reduce((sum, record) => {
    if (record.type === 'income') {
      return sum + record.amount;
    }
    return sum;
  }, 0);

  const overallExpenses = filteredRecords.reduce((sum, record) => {
    if (record.type === 'expense') {
      return sum + Math.abs(record.amount);
    }
    return sum;
  }, 0);

  const netBalance = overallIncome - overallExpenses;

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
        style={{ flex: 1 }}
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
          {displayedRecords.map((record, index) => {
            const category = getCategoryDefinition(record.categoryId);
            const categoryColor = getCategoryColor(record.categoryId, palette.tint);
            const iconName = getCategoryIcon(record.categoryId, record.type === 'income' ? 'wallet-plus' : 'shape-outline');
            const isIncome = category?.type === 'income' || record.type === 'income';
            const readableDate = formatFriendlyDate(record.date);
            const amountColor = isIncome ? palette.success : palette.error;

            return (
              <Fragment key={record.id}>
                <View style={styles.recordRow}>
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
                    <ThemedText adjustsFontSizeToFit numberOfLines={1} style={[styles.recordAmount, { color: amountColor }]}>
                      {isIncome ? '+' : '-'}{formatCurrency(record.amount)}
                    </ThemedText>
                    <ThemedText style={{ color: palette.icon, textAlign: 'right' }}>{readableDate}</ThemedText>
                  </View>
                </View>
                {index < displayedRecords.length - 1 && (
                  <View style={[styles.recordDivider, { backgroundColor: palette.border }]} />
                )}
              </Fragment>
            );
          })}

          <Pressable
            onPress={() => router.push('/records')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}
          >
            <ThemedText style={{ color: palette.tint, fontWeight: '600' }}>Show more</ThemedText>
            <MaterialCommunityIcons name="chevron-right" size={16} color={palette.tint} accessibilityHint={undefined} />
          </Pressable>
        </ThemedView>
      </ScrollView>
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
    </SafeAreaView>
  );
}

const styles = homeStyles;