import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, TouchableOpacity, View } from 'react-native';
import type { FABGroupProps } from 'react-native-paper';
import { FAB, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import RecordList from '@/components/RecordList';
import { RecordsFilterSheet } from '@/components/RecordsFilterSheet';
import { ThemedText } from '@/components/themed-text';
import { TransactionTypeFilter, type TransactionTypeValue } from '@/components/TransactionTypeFilter';
import { DEFAULT_RECORD_TYPE, SORT_OPTIONS, type SortOption } from '@/constants/records';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRecordsData } from '@/hooks/use-records-data';
import { useRecordsFiltering } from '@/hooks/use-records-filtering';
import { recordsStyles as styles } from '@/styles/records.styles';
import { subscribeToRecordFiltersReset } from '@/utils/navigation-events';

export default function RecordsScreen() {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const accent = palette.tint;
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const isFocused = useIsFocused();

  const [selectedRecordType, setSelectedRecordType] = useState<TransactionTypeValue>(DEFAULT_RECORD_TYPE);
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const {
    transactions,
    refreshTransactions,
    maxTransactionAbs,
    uniquePayers,
    uniqueLabels,
  } = useRecordsData();

  useFocusEffect(
    useCallback(() => {
      refreshTransactions();
    }, [refreshTransactions]),
  );

  useEffect(() => {
    if (!isFocused) {
      setFabOpen(false);
    }
  }, [isFocused]);

  useEffect(() => {
    const unsubscribe = subscribeToRecordFiltersReset(() => {
      setSelectedRecordType(DEFAULT_RECORD_TYPE);
      setSortOption('date-desc');
      setShowFilters(false);
      setShowSortDropdown(false);
    });
    return unsubscribe;
  }, []);

  const { filteredAndSortedData, appliedFiltersCount, filterLabel, sortLabel } = useRecordsFiltering(
    transactions,
    sortOption,
    selectedRecordType,
  );

  const filterIconColor = appliedFiltersCount > 0 ? palette.tint : palette.icon;
  const sortIconColor = sortOption === 'date-desc' ? palette.icon : palette.tint;
  const mainFabColor = fabOpen ? palette.card : accent;
  const mainFabIconColor = fabOpen ? palette.text : '#FFFFFF';

  const formatCurrency = useCallback((value: number, type: 'income' | 'expense') => {
    const abs = Math.abs(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${type === 'income' ? '+' : '-'}$${abs}`;
  }, []);

  const handleFabNavigate = useCallback(
    (path: Parameters<typeof router.push>[0]) => {
      setFabOpen(false);
      router.push(path as Parameters<typeof router.push>[0]);
    },
    [router],
  );

  const fabActions = useMemo<FABGroupProps['actions']>(
    () => [
      {
        icon: 'camera',
        label: t('scan_receipt'),
        labelTextColor: '#FFFFFF',
        color: palette.accent,
        style: { backgroundColor: palette.card, borderRadius: 28 },
        onPress: () => handleFabNavigate('/scan'),
        small: true,
      },
      {
        icon: 'plus',
        label: t('add_record'),
        labelTextColor: '#FFFFFF',
        color: '#FFFFFF',
        style: { backgroundColor: palette.tint, transform: [{ scale: 1.1 }], borderRadius: 28 },
        onPress: () => handleFabNavigate('/log-expenses'),
        small: false,
      },
    ],
    [handleFabNavigate, palette, i18n.language],
  );

  return (
    <SafeAreaView style={[styles.safeArea]} edges={['top', 'bottom']}>
      <View style={{ flex: 1, overflow: 'visible',  marginTop: '-50' }}>
        <View style={styles.header}>
          <View style={styles.filterRow}>
            <View style={styles.chipWrapper}>
              <TransactionTypeFilter
                value={selectedRecordType}
                onChange={setSelectedRecordType}
                options={['expense', 'income', 'all']}
                style={styles.chipRow}
                variant="compact"
                labelSize="small"
              />
            </View>
            <View style={styles.actionIcons}>
              <TouchableOpacity
                style={{ alignItems: 'center' }}
                onPress={() => setShowFilters(true)}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <View style={[styles.actionIcon, { borderColor: filterIconColor }]}>
                  <MaterialCommunityIcons name="tune-variant" size={18} color={filterIconColor} />
                </View>
                <ThemedText style={{ fontSize: FontSizes.xs, color: filterIconColor, marginTop: 2 }}>
                  {filterLabel}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ alignItems: 'center' }}
                onPress={() => setShowSortDropdown((prev) => !prev)}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <View style={[styles.actionIcon, { borderColor: sortIconColor }]}>
                  <MaterialCommunityIcons name="swap-vertical" size={18} color={sortIconColor} />
                </View>
                <ThemedText style={{ fontSize: FontSizes.xs, color: sortIconColor, marginTop: 2 }}>
                  {sortLabel}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.recordsCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <RecordList
            records={filteredAndSortedData}
            variant="records"
            style={{ flex: 1 }}
            formatCurrency={(value, type = 'expense') => formatCurrency(value, type)}
            onPressItem={(item) => {
              const occurredAt = item.date instanceof Date ? item.date.toISOString() : new Date(item.date).toISOString();
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
            bottomInset={tabBarHeight}
          />
        </View>
      </View>

      <Modal transparent visible={showSortDropdown} animationType="none" onRequestClose={() => setShowSortDropdown(false)}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowSortDropdown(false)} />
        <View
          style={[
            styles.sortDropdown,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
              position: 'absolute',
              top: 100,
              right: 20,
            },
          ]}
        >
          <View style={styles.sortHeader}>
            <ThemedText style={[styles.sortTitle, { color: palette.text }]}>{t('sort_by')}</ThemedText>
            <TouchableOpacity onPress={() => setShowSortDropdown(false)}>
              <MaterialCommunityIcons name="close" size={20} color={palette.icon} />
            </TouchableOpacity>
          </View>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortOption,
                sortOption === option.value && { backgroundColor: `${palette.tint}12` },
              ]}
              onPress={() => {
                setSortOption(option.value);
                setShowSortDropdown(false);
              }}
            >
              <ThemedText style={[styles.sortOptionText, { color: palette.text }]}>
                {option.label}
              </ThemedText>
              {sortOption === option.value && (
                <MaterialCommunityIcons name="check" size={18} color={palette.tint} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {isFocused && (
        <Portal>
          {fabOpen && <Pressable style={styles.fabBackdrop} onPress={() => setFabOpen(false)} />}
          <FAB.Group
            open={fabOpen}
            icon={fabOpen ? 'close' : 'plus'}
            visible
            actions={fabActions}
            onStateChange={({ open }) => setFabOpen(open)}
            fabStyle={[
              styles.fabMain,
              {
                backgroundColor: mainFabColor,
                borderColor: palette.border,
                borderWidth: fabOpen ? 1 : 0,
              },
            ]}
            style={[styles.fabGroupContainer, { bottom: tabBarHeight + Spacing.md }]}
            color={mainFabIconColor}
            backdropColor="transparent"
          />
        </Portal>
      )}

      <RecordsFilterSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        selectedRecordType={selectedRecordType}
        onRecordTypeChange={setSelectedRecordType}
        onResetSortOption={() => setSortOption('date-desc')}
        maxTransactionAbs={maxTransactionAbs}
        uniquePayers={uniquePayers}
        uniqueLabels={uniqueLabels}
      />
    </SafeAreaView>
  );
}
