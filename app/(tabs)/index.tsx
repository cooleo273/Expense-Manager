import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Modal, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExpenseStructureCard } from '@/components/ExpenseStructureCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCategoryColor, getCategoryDefinition, getCategoryIcon, type CategoryKey } from '@/constants/categories';
import { Colors, IconSizes } from '@/constants/theme';
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
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const optionAnim = useRef(new Animated.Value(0)).current;
  const window = Dimensions.get('window');
  const FAB_SIZE = 60;
  const overlayDiameter = Math.sqrt(window.width * window.width + window.height * window.height) * 1.1;
  const [transactions, setTransactions] = useState<any[]>([]);

  const overlayBottom = overlayAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [tabBarHeight + 20, tabBarHeight + 20, 0],
    extrapolate: 'clamp',
  });
  const overlayRight = overlayAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [20, 20, 0],
    extrapolate: 'clamp',
  });
  const overlayWidth = overlayAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [FAB_SIZE, overlayDiameter, window.width + 40],
    extrapolate: 'clamp',
  });
  const overlayHeight = overlayAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [FAB_SIZE, overlayDiameter, window.height + 40],
    extrapolate: 'clamp',
  });
  const overlayTopLeftRadius = overlayAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [FAB_SIZE / 2, overlayDiameter, 0],
    extrapolate: 'clamp',
  });
  const overlayBottomRightRadius = overlayAnim.interpolate({
    inputRange: [0, 0.9, 1],
    outputRange: [FAB_SIZE / 2, FAB_SIZE / 2, 0],
    extrapolate: 'clamp',
  });
  const overlayOpacity = overlayAnim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0.85, 0.9],
    extrapolate: 'clamp',
  });

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

  useEffect(() => {
    if (showOverlay) {
      // Reset animation values to 0 before starting the opening animation
      overlayAnim.setValue(0);
      optionAnim.setValue(0);

      // sequence: expand overlay then slide in options with easing
      Animated.sequence([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(optionAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
      ]).start();
    } else {
      // parallel: slide out options and collapse overlay with easing
      Animated.parallel([
        Animated.timing(optionAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 260,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: false
        }),
      ]).start();
    }
  }, [showOverlay, overlayAnim, optionAnim]);

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
      <Pressable style={[styles.fab, { backgroundColor: palette.tint, bottom: tabBarHeight + 20 }]} onPress={() => setShowOverlay(true)}>
        <MaterialCommunityIcons name="plus" size={24} color="white" accessibilityHint={undefined} />
      </Pressable>
      <Modal transparent visible={showOverlay} onRequestClose={() => setShowOverlay(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowOverlay(false)}>
          {/* animated translucent overlay background */}
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                bottom: overlayBottom,
                right: overlayRight,
                width: overlayWidth,
                height: overlayHeight,
                borderTopLeftRadius: overlayTopLeftRadius,
                borderBottomRightRadius: overlayBottomRightRadius,
                borderTopRightRadius: 0,
                borderBottomLeftRadius: 0,
                backgroundColor: 'rgba(0,0,0,0.68)',
                opacity: overlayOpacity,
              },
            ]}
          />

          {/* Scan (smaller, placed above) */}
          <Animated.View
            style={[
              styles.fabOption,
              {
                bottom: tabBarHeight + 80,
                opacity: optionAnim,
                transform: [
                  { translateY: optionAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                  { translateX: optionAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                ],
              },
            ]}
          >
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => { setShowOverlay(false); router.push('/scan'); }}
            >
              <View style={[styles.optionTextContainer, { backgroundColor: 'rgba(0,0,0,0.6)', borderColor: 'transparent' }]}> 
                <ThemedText style={[styles.fabOptionTextSmall, { color: 'white' }]}>Scan Receipt</ThemedText>
              </View>
              <View style={[styles.iconCircle, { backgroundColor: palette.accent }]}> 
                <MaterialCommunityIcons name="camera" size={16} color="white" accessibilityHint={undefined} />
              </View>
            </Pressable>
          </Animated.View>

          {/* Add Record (larger, placed nearer the bottom) */}
          <Animated.View
            style={[
              styles.fabOption,
              {
                bottom: tabBarHeight + 20,
                opacity: optionAnim,
                transform: [
                  { translateY: optionAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
                  { translateX: optionAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
                ],
              },
            ]}
          >
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => { setShowOverlay(false); router.push('/log-expenses'); }}
            >
              <View style={[styles.optionTextContainer, { backgroundColor: 'rgba(0,0,0,0.7)', borderColor: 'transparent' }]}> 
                <ThemedText style={[styles.fabOptionTextLarge, { color: 'white' }]}>Add Record</ThemedText>
              </View>
              <View style={[styles.iconCircleLarge, { backgroundColor: 'white' }]}> 
                <MaterialCommunityIcons name="plus" size={20} color={palette.tint} accessibilityHint={undefined} />
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = homeStyles;