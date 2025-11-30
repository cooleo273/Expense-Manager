import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { Portal } from 'react-native-paper';

import { AccountDropdown } from '@/components/AccountDropdown';
import DualSlider from '@/components/DualSlider';
import { ThemedText } from '@/components/themed-text';
import { TransactionTypeFilter, type TransactionTypeValue } from '@/components/TransactionTypeFilter';
import { getNodeDisplayName } from '@/constants/categories';
import { getAccountMeta } from '@/constants/mock-data';
import { DEFAULT_RECORD_TYPE, WEEKDAY_LABELS } from '@/constants/records';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { DatePreset, DateRange, useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { recordsStyles as styles } from '@/styles/records.styles';
import { getRelativePeriodLabel, isSameDay, normalizeRange, startOfDay } from '@/utils/date';

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const getMonthMatrix = (cursor: Date) => {
  const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const firstDayOfWeek = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - firstDayOfWeek);

  const weeks: Date[][] = [];
  for (let week = 0; week < 6; week++) {
    const days: Date[] = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + week * 7 + day);
      days.push(date);
    }
    weeks.push(days);
  }
  return weeks;
};

const formatMonthTitle = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

type DraftRange = {
  start: Date;
  end?: Date;
};

type LocalFilters = {
  selectedPayers: string[];
  selectedLabels: string[];
  keyTerms: string[];
  amountRange: { min: number; max: number } | null;
  dateRange: DateRange | null;
  selectedAccount: string;
  selectedRecordType: TransactionTypeValue;
  datePreset: DatePreset | null;
};

type RecordsFilterSheetProps = {
  visible: boolean;
  onClose: () => void;
  selectedRecordType: TransactionTypeValue;
  onRecordTypeChange: (value: TransactionTypeValue) => void;
  onResetSortOption: () => void;
  maxTransactionAbs: number;
  uniquePayers: string[];
  uniqueLabels: string[];
};

const splitTokens = (raw: string) =>
  raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

const mergeTokens = (current: string[] = [], incoming: string[]) => {
  const normalized = new Set(current.map((token) => token.toLowerCase()));
  const next = [...current];
  incoming.forEach((token) => {
    const trimmed = token.trim();
    if (!trimmed) {
      return;
    }
    const key = trimmed.toLowerCase();
    if (normalized.has(key)) {
      return;
    }
    normalized.add(key);
    next.push(trimmed);
  });
  return next;
};

export const RecordsFilterSheet: React.FC<RecordsFilterSheetProps> = ({
  visible,
  onClose,
  selectedRecordType,
  onRecordTypeChange,
  onResetSortOption,
  maxTransactionAbs,
  uniquePayers,
  uniqueLabels,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const accent = palette.tint;
  const router = useRouter();
  const {
    filters,
    setSelectedCategories,
    applyDateFilter,
    setAmountRange,
    setSelectedPayers,
    setSelectedLabels,
    setKeyTerms,
    setSelectedAccount,
    resetFilters,
    setTempSelectedCategories,
  } = useFilterContext();

  const [expandedFilter, setExpandedFilter] = useState<string | null>('recordType');
  const [localMinAmount, setLocalMinAmount] = useState<number>(0);
  const [localMaxAmount, setLocalMaxAmount] = useState<number>(maxTransactionAbs);
  const [payerInput, setPayerInput] = useState('');
  const [keyTermInput, setKeyTermInput] = useState('');
  const [labelSearchQuery, setLabelSearchQuery] = useState('');
  const [showPayerNote, setShowPayerNote] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'presets' | 'custom'>('presets');
  const today = useMemo(() => startOfDay(new Date()), []);
  const [monthCursor, setMonthCursor] = useState(startOfDay(new Date()));
  const [draftRange, setDraftRange] = useState<DraftRange | null>(null);
  const [localFilters, setLocalFilters] = useState<LocalFilters>({
    selectedPayers: [],
    selectedLabels: [],
    keyTerms: [],
    amountRange: null,
    dateRange: null,
    selectedAccount: 'all',
    selectedRecordType: selectedRecordType ?? DEFAULT_RECORD_TYPE,
    datePreset: filters.datePreset ?? null,
  });

  useEffect(() => {
    if (!visible) {
      return;
    }
    setLocalFilters({
      selectedPayers: filters.selectedPayers || [],
      selectedLabels: filters.selectedLabels || [],
      keyTerms: filters.keyTerms || [],
      amountRange: filters.amountRange
        ? {
            min: filters.amountRange.min ?? 0,
            max: filters.amountRange.max ?? maxTransactionAbs,
          }
        : null,
      dateRange: filters.dateRange,
      selectedAccount: filters.selectedAccount || 'all',
      selectedRecordType: selectedRecordType ?? DEFAULT_RECORD_TYPE,
      datePreset: filters.datePreset ?? null,
    });
    setTempSelectedCategories(filters.selectedCategories);
    setLocalMinAmount(filters.amountRange?.min ?? 0);
    setLocalMaxAmount(filters.amountRange?.max ?? maxTransactionAbs);
    setPayerInput('');
    setKeyTermInput('');
    setLabelSearchQuery('');
    setExpandedFilter('recordType');
    setShowPayerNote(false);
  }, [
    visible,
    filters.selectedPayers,
    filters.selectedLabels,
    filters.keyTerms,
    filters.amountRange,
    filters.dateRange,
    filters.selectedAccount,
    filters.selectedCategories,
    maxTransactionAbs,
    selectedRecordType,
    setTempSelectedCategories,
  ]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (!filters.dateRange) {
      setDraftRange(null);
      setMonthCursor(startOfDay(new Date()));
      return;
    }
    setDraftRange({
      start: startOfDay(filters.dateRange.start),
      end: startOfDay(filters.dateRange.end),
    });
    setMonthCursor(startOfDay(filters.dateRange.start));
  }, [visible, filters.dateRange]);

  useEffect(() => {
    setLocalMaxAmount((prev) => {
      if (localFilters.amountRange?.max != null) {
        return localFilters.amountRange.max;
      }
      return Math.max(prev, maxTransactionAbs);
    });
  }, [maxTransactionAbs, localFilters.amountRange]);

  const addPayers = useCallback(
    (tokens: string[]) => {
      if (!tokens.length) {
        return;
      }
      setLocalFilters((prev) => ({
        ...prev,
        selectedPayers: mergeTokens(prev.selectedPayers ?? [], tokens),
      }));
    },
    [setLocalFilters],
  );

  const addKeyTerms = useCallback(
    (tokens: string[]) => {
      if (!tokens.length) {
        return;
      }
      setLocalFilters((prev) => ({
        ...prev,
        keyTerms: mergeTokens(prev.keyTerms ?? [], tokens),
      }));
    },
    [setLocalFilters],
  );

  const handlePayerInputChange = useCallback(
    (text: string) => {
      if (!text.includes(',')) {
        setPayerInput(text);
        return;
      }
      const segments = text.split(',');
      const trailing = text.endsWith(',') ? '' : segments.pop() ?? '';
      const tokens = segments.map((segment) => segment.trim()).filter(Boolean);
      if (tokens.length) {
        addPayers(tokens);
      }
      setPayerInput(trailing.trimStart());
    },
    [addPayers],
  );

  const handleKeyTermInputChange = useCallback(
    (text: string) => {
      if (!text.includes(',')) {
        setKeyTermInput(text);
        return;
      }
      const segments = text.split(',');
      const trailing = text.endsWith(',') ? '' : segments.pop() ?? '';
      const tokens = segments.map((segment) => segment.trim()).filter(Boolean);
      if (tokens.length) {
        addKeyTerms(tokens);
      }
      setKeyTermInput(trailing.trimStart());
    },
    [addKeyTerms],
  );

  const finalizePayerInput = useCallback(() => {
    const raw = payerInput.trim();
    if (!raw) {
      setPayerInput(raw);
      return localFilters.selectedPayers ?? [];
    }
    const tokens = splitTokens(raw);
    if (!tokens.length) {
      setPayerInput('');
      return localFilters.selectedPayers ?? [];
    }
    let nextValues: string[] = localFilters.selectedPayers ?? [];
    setLocalFilters((prev) => {
      const merged = mergeTokens(prev.selectedPayers ?? [], tokens);
      nextValues = merged;
      return { ...prev, selectedPayers: merged };
    });
    setPayerInput('');
    return nextValues;
  }, [payerInput, localFilters.selectedPayers]);

  const finalizeKeyTermInput = useCallback(() => {
    const raw = keyTermInput.trim();
    if (!raw) {
      setKeyTermInput(raw);
      return localFilters.keyTerms ?? [];
    }
    const tokens = splitTokens(raw);
    if (!tokens.length) {
      setKeyTermInput('');
      return localFilters.keyTerms ?? [];
    }
    let nextValues: string[] = localFilters.keyTerms ?? [];
    setLocalFilters((prev) => {
      const merged = mergeTokens(prev.keyTerms ?? [], tokens);
      nextValues = merged;
      return { ...prev, keyTerms: merged };
    });
    setKeyTermInput('');
    return nextValues;
  }, [keyTermInput, localFilters.keyTerms]);

  const handleRemovePayer = useCallback(
    (value: string) => {
      setLocalFilters((prev) => ({
        ...prev,
        selectedPayers: (prev.selectedPayers ?? []).filter((item) => item !== value),
      }));
    },
    [],
  );

  const handleRemoveKeyTerm = useCallback(
    (value: string) => {
      setLocalFilters((prev) => ({
        ...prev,
        keyTerms: (prev.keyTerms ?? []).filter((item) => item !== value),
      }));
    },
    [],
  );

  const executeResetFilters = useCallback(() => {
    onRecordTypeChange(DEFAULT_RECORD_TYPE);
    onResetSortOption();
    resetFilters();
    setSelectedCategories([]);
    setTempSelectedCategories([]);
    setSelectedAccount('all');
    setAmountRange(null);
    applyDateFilter(null, null);
    setSelectedPayers([]);
    setSelectedLabels([]);
    setKeyTerms([]);
    setLocalMinAmount(0);
    setLocalMaxAmount(maxTransactionAbs);
    setLocalFilters({
      selectedPayers: [],
      selectedLabels: [],
      keyTerms: [],
      amountRange: null,
      dateRange: null,
      selectedAccount: 'all',
      selectedRecordType: DEFAULT_RECORD_TYPE,
      datePreset: null,
    });
    setDraftRange(null);
    setCalendarMode('presets');
    setMonthCursor(startOfDay(new Date()));
    setExpandedFilter('recordType');
    setPayerInput('');
    setKeyTermInput('');
    setLabelSearchQuery('');
    setShowPayerNote(false);
    setShowCalendarModal(false);
  }, [
    applyDateFilter,
    maxTransactionAbs,
    onRecordTypeChange,
    onResetSortOption,
    resetFilters,
    setAmountRange,
    setCalendarMode,
    setDraftRange,
    setKeyTerms,
    setMonthCursor,
    setSelectedAccount,
    setSelectedCategories,
    setSelectedLabels,
    setSelectedPayers,
    setShowCalendarModal,
    setTempSelectedCategories,
  ]);

  const confirmResetFilters = useCallback(() => {
    Alert.alert(
      t('reset_filters'),
      t('reset_filters_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('reset'),
          style: 'destructive',
          onPress: executeResetFilters,
        },
      ],
      { cancelable: true },
    );
  }, [executeResetFilters]);

  const selectedCategoryLabels = useMemo(
    () =>
      filters.tempSelectedCategories
        .map((id) => getNodeDisplayName(id))
        .filter((name): name is string => Boolean(name)),
    [filters.tempSelectedCategories],
  );

  const filterSections = useMemo(() => {
    return [
      {
        id: 'recordType',
        title: t('record_type'),
        detail: undefined,
        chips: [t('expense'), t('income'), t('all')],
      },
      {
        id: 'categories',
        title: `${t('categories')} (${filters.tempSelectedCategories.length || t('all')})`,
        detail:
          selectedCategoryLabels.length > 0
            ? `${selectedCategoryLabels.slice(0, 3).join(', ')}${
                selectedCategoryLabels.length > 3 ? '...' : ''
              }`
            : t('categories_placeholder'),
      },
      {
        id: 'payers',
        title: t('payers_payees'),
        detail:
          localFilters.selectedPayers && localFilters.selectedPayers.length > 0
            ? `${localFilters.selectedPayers.slice(0, 2).join(', ')}${
                localFilters.selectedPayers.length > 2 ? '…' : ''
              }`
            : t('comma_separated'),
      },
      {
        id: 'labels',
        title: t('labels'),
        detail:
          localFilters.selectedLabels && localFilters.selectedLabels.length > 0
            ? `${localFilters.selectedLabels.length} ${t('selected')}`
            : undefined,
      },
      {
        id: 'keyTerms',
        title: t('key_terms'),
        detail:
          localFilters.keyTerms && localFilters.keyTerms.length > 0
            ? `${localFilters.keyTerms.slice(0, 3).join(', ')}${
                localFilters.keyTerms.length > 3 ? '…' : ''
              }`
            : t('key_terms_placeholder'),
      },
      {
        id: 'amount',
        title: t('amount'),
        detail:
          localFilters.amountRange
            ? `$${(localFilters.amountRange.min ?? 0).toLocaleString()} - $${
                (localFilters.amountRange.max ?? maxTransactionAbs).toLocaleString()
              }`
            : t('any_amount'),
      },
      {
        id: 'accounts',
        title:
          localFilters.selectedAccount === 'all'
            ? `${t('account')} (${t('all')})`
            : `${t('account')} (${getAccountMeta(localFilters.selectedAccount)?.name ?? t('custom')})`,
        detail:
          localFilters.selectedAccount === 'all'
            ? undefined
            : getAccountMeta(localFilters.selectedAccount)?.subtitle,
      },
      {
        id: 'timePeriod',
        title: t('time_period'),
        detail: formatTimePeriod(localFilters.dateRange),
      },
    ];
  }, [
    filters.tempSelectedCategories,
    localFilters.amountRange,
    localFilters.keyTerms,
    localFilters.selectedAccount,
    localFilters.selectedLabels,
    localFilters.dateRange,
    localFilters.selectedPayers,
    maxTransactionAbs,
    selectedCategoryLabels,
  ]);

  const filteredLabelSuggestions = useMemo(() => {
    const query = labelSearchQuery.trim().toLowerCase();
    if (!query) {
      return uniqueLabels;
    }
    return uniqueLabels.filter((label) => label.toLowerCase().includes(query));
  }, [labelSearchQuery, uniqueLabels]);

  const monthMatrix = useMemo(() => getMonthMatrix(monthCursor), [monthCursor]);

  const isWithinDraftRange = useCallback(
    (date: Date) => {
      if (!draftRange) {
        return false;
      }
      if (draftRange.start && draftRange.end) {
        const start = draftRange.start < draftRange.end ? draftRange.start : draftRange.end;
        const end = draftRange.start < draftRange.end ? draftRange.end : draftRange.start;
        return date >= start && date <= end;
      }
      return draftRange.start && isSameDay(draftRange.start, date);
    },
    [draftRange],
  );

  const handleDayPress = useCallback((date: Date) => {
    const normalized = startOfDay(date);
    if (normalized > today) {
      return;
    }
    setDraftRange((prev) => {
      if (!prev || (prev.start && prev.end)) {
        return { start: normalized };
      }
      if (prev.start && !prev.end) {
        return { start: prev.start, end: normalized };
      }
      return { start: normalized };
    });
  }, [today]);

  const applyRange = useCallback(
    (range: DateRange | null, preset: DatePreset | null) => {
      const normalized = range ? normalizeRange(range) : null;
      setLocalFilters((prev) => ({ ...prev, dateRange: normalized, datePreset: preset }));
      if (normalized) {
        setDraftRange({ start: normalized.start, end: startOfDay(normalized.end) });
        setMonthCursor(startOfDay(normalized.start));
      } else {
        setDraftRange(null);
        setMonthCursor(startOfDay(new Date()));
      }
      setShowCalendarModal(false);
    },
    [],
  );

  const handleConfirmRange = useCallback(() => {
    if (!draftRange) {
      applyRange(null, null);
      return;
    }
    const { start, end } = draftRange;
    if (start && end) {
      const orderedStart = start < end ? start : end;
      const orderedEnd = start < end ? end : start;
      applyRange({ start: orderedStart, end: orderedEnd }, 'custom');
    } else if (start) {
      applyRange({ start, end: start }, 'custom');
    }
  }, [draftRange, applyRange]);

  const quickSelect = useCallback(
    (option: 'all' | 'week' | 'month' | 'year') => {
      const now = new Date();
      if (option === 'all') {
        applyRange(null, 'all');
        return;
      }
      if (option === 'week') {
        const start = startOfDay(now);
        const weekday = (start.getDay() + 6) % 7;
        start.setDate(start.getDate() - weekday);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        applyRange({ start, end }, 'week');
        return;
      }
      if (option === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        applyRange({ start: startOfDay(start), end: startOfDay(end) }, 'month');
        return;
      }
      if (option === 'year') {
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        applyRange({ start: startOfDay(start), end: startOfDay(end) }, 'year');
      }
    },
    [applyRange],
  );

  return (
    <>
      <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
        <Portal.Host>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
            <View
              style={[styles.filterSheet, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <View style={styles.filterHeader}>
                <TouchableOpacity onPress={onClose}>
                  <MaterialCommunityIcons name="close" size={24} color={palette.icon} />
                </TouchableOpacity>
                <ThemedText style={[styles.filterTitle, { color: palette.text }]}>{t('filters')}</ThemedText>
                <TouchableOpacity onPress={confirmResetFilters}>
                  <ThemedText style={{ color: accent, fontWeight: '600' }}>{t('reset')}</ThemedText>
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.filterContent}>
                {filterSections.map((section) => {
                  const isExpanded = expandedFilter === section.id;
                  const isActive = (() => {
                    switch (section.id) {
                      case 'recordType':
                        return localFilters.selectedRecordType !== 'all';
                      case 'categories':
                        return (filters.tempSelectedCategories || []).length > 0;
                      case 'payers':
                        return (filters.selectedPayers || []).length > 0;
                      case 'labels':
                        return (filters.selectedLabels || []).length > 0;
                      case 'keyTerms':
                        return (filters.keyTerms || []).length > 0;
                      case 'amount':
                        return !!(
                          filters.amountRange &&
                          (filters.amountRange.min != null || filters.amountRange.max != null)
                        );
                      case 'timePeriod':
                        return !!filters.dateRange;
                      case 'accounts':
                        return filters.selectedAccount && filters.selectedAccount !== 'all';
                      default:
                        return false;
                    }
                  })();

                  return (
                    <View key={section.id}>
                      {section.id === 'categories' ? (
                        <>
                          <TouchableOpacity
                            onPress={() =>
                              router.push({
                                pathname: '/Category',
                                params: {
                                  from: 'filter',
                                  type:
                                    localFilters.selectedRecordType !== 'all'
                                      ? localFilters.selectedRecordType
                                      : undefined,
                                },
                              })
                            }
                          >
                            <View
                              style={[
                                styles.filterRowItem,
                                (isExpanded || isActive) && {
                                  backgroundColor: `${palette.tint}0F`,
                                  borderColor: palette.tint,
                                  borderWidth: 1,
                                },
                              ]}
                            >
                              <View style={styles.filterRowText}>
                                <ThemedText style={[styles.filterRowTitle, { color: palette.text }]}>
                                  {section.title}
                                </ThemedText>
                                {section.detail && (
                                  <ThemedText style={{ color: palette.icon, marginTop: 4 }}>
                                    {section.detail}
                                  </ThemedText>
                                )}
                              </View>
                              <MaterialCommunityIcons name="chevron-down" size={22} color={palette.icon} />
                            </View>
                          </TouchableOpacity>
                          {filters.tempSelectedCategories.length > 0 && (
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              style={styles.categoryBadgeRow}
                              contentContainerStyle={styles.categoryBadgeInner}
                            >
                              {selectedCategoryLabels.map((label) => (
                                <View
                                  key={label}
                                  style={[
                                    styles.categoryBadge,
                                    { backgroundColor: `${palette.tint}18`, borderColor: palette.border },
                                  ]}
                                >
                                  <ThemedText style={{ color: palette.text, fontSize: FontSizes.sm }}>
                                    {label}
                                  </ThemedText>
                                </View>
                              ))}
                            </ScrollView>
                          )}
                        </>
                      ) : section.id === 'timePeriod' ? (
                        <TouchableOpacity onPress={() => setShowCalendarModal(true)}>
                          <View style={[styles.filterRowItem]}>
                            <View style={styles.filterRowText}>
                              <ThemedText style={[styles.filterRowTitle, { color: palette.text }]}>
                                {section.title}
                              </ThemedText>
                              {section.detail && (
                                <ThemedText style={{ color: palette.icon, marginTop: 4 }}>
                                  {section.detail}
                                </ThemedText>
                              )}
                            </View>
                            <MaterialCommunityIcons name="chevron-down" size={22} color={palette.icon} />
                          </View>
                        </TouchableOpacity>
                      ) : section.id === 'accounts' ? (
                        <View>
                          <View
                            style={[
                              styles.filterRowItem,
                              isActive && {
                                backgroundColor: `${palette.tint}0F`,
                                borderColor: palette.tint,
                                borderWidth: 1,
                              },
                            ]}
                          >
                            <View style={styles.filterRowText}>
                              <ThemedText style={[styles.filterRowTitle, { color: palette.text }]}>
                                {section.title}
                              </ThemedText>
                              {section.detail && (
                                <ThemedText style={{ color: palette.icon, marginTop: 4 }}>
                                  {section.detail}
                                </ThemedText>
                              )}
                            </View>
                          <AccountDropdown
                            allowAll
                            useGlobalState={false}
                            selectedId={localFilters.selectedAccount}
                            onSelect={(accountId) =>
                              setLocalFilters((prev) => ({ ...prev, selectedAccount: accountId }))
                            }
                            hideLabelWhenAll
                            showSelectedLabel={false}
                          />
                          </View>
                          <View style={[styles.separator, { backgroundColor: palette.border }]} />
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() =>
                          setExpandedFilter((prev) => (prev === section.id ? null : section.id))
                        }
                        activeOpacity={0.85}
                      >
                        <View style={[styles.filterRowItem]}>
                          <View style={styles.filterRowText}>
                            {section.id === 'payers' ? (
                              <View style={styles.titleWithIcon}>
                                <ThemedText style={[styles.filterRowTitle, { color: palette.text }]}>
                                  {section.title}
                                </ThemedText>
                                <TouchableOpacity
                                  onPress={() => setShowPayerNote((prev) => !prev)}
                                  style={styles.titleInfoIcon}
                                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                >
                                  <MaterialCommunityIcons
                                    name="information-outline"
                                    size={14}
                                    color={palette.icon}
                                  />
                                </TouchableOpacity>
                              </View>
                            ) : (
                              <ThemedText style={[styles.filterRowTitle, { color: palette.text }]}>
                                {section.title}
                              </ThemedText>
                            )}
                            {section.detail && (
                              <ThemedText style={{ color: palette.icon, marginTop: 4 }}>
                                {section.detail}
                              </ThemedText>
                            )}
                            {section.chips && section.id === 'recordType' && isExpanded && (
                              <TransactionTypeFilter
                                value={localFilters.selectedRecordType}
                                onChange={(value) =>
                                  setLocalFilters((prev) => ({ ...prev, selectedRecordType: value }))
                                }
                                options={['expense', 'income', 'all']}
                                variant="compact"
                                labelSize="small"
                                style={{ marginTop: Spacing.sm }}
                              />
                            )}
                            {section.id === 'payers' && isExpanded && (
                              <View style={[styles.tokenInputSection, { marginTop: Spacing.md }]}>
                                <View
                                  style={[
                                    styles.tokenInputRow,
                                    { borderColor: palette.border, backgroundColor: palette.surface },
                                  ]}
                                >
                                  <TextInput
                                    style={[styles.tokenInput, { color: palette.text }]}
                                    value={payerInput}
                                    onChangeText={handlePayerInputChange}
                                    onBlur={finalizePayerInput}
                                    onSubmitEditing={finalizePayerInput}
                                    placeholder="Enter payers or payees (comma separated)"
                                    placeholderTextColor={palette.icon}
                                    autoCapitalize="words"
                                    keyboardType="default"
                                    returnKeyType="done"
                                  />
                                </View>
                                {showPayerNote && (
                                  <View style={[styles.infoRow, { marginTop: Spacing.xs }]}>
                                    <MaterialCommunityIcons
                                      name="information-outline"
                                      size={14}
                                      color={palette.icon}
                                    />
                                    <ThemedText style={[styles.infoText, { color: palette.icon }]}>
                                      Separate multiple names with commas or the return key.
                                    </ThemedText>
                                  </View>
                                )}
                                {localFilters.selectedPayers.length > 0 && (
                                  <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.tokenScrollRow}
                                    contentContainerStyle={styles.tokenScrollInner}
                                  >
                                    {localFilters.selectedPayers.map((payer) => (
                                      <View
                                        key={payer}
                                        style={[
                                          styles.tokenChip,
                                          { backgroundColor: `${palette.tint}18`, borderColor: palette.border },
                                        ]}
                                      >
                                        <ThemedText style={[styles.tokenChipText, { color: palette.text }]}>
                                          {payer}
                                        </ThemedText>
                                        <TouchableOpacity
                                          onPress={() => handleRemovePayer(payer)}
                                          style={styles.tokenRemoveButton}
                                        >
                                          <MaterialCommunityIcons name="close" size={14} color={palette.icon} />
                                        </TouchableOpacity>
                                      </View>
                                    ))}
                                  </ScrollView>
                                )}
                                {uniquePayers.length === 0 && (
                                  <ThemedText style={{ color: palette.icon, marginTop: Spacing.sm }}>
                                    No payers found
                                  </ThemedText>
                                )}
                              </View>
                            )}
                            {section.id === 'labels' && isExpanded && (
                              <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
                                <View
                                  style={[
                                    styles.tokenInputRow,
                                    { borderColor: palette.border, backgroundColor: palette.surface },
                                  ]}
                                >
                                  <TextInput
                                    style={[styles.tokenInput, { color: palette.text }]}
                                    value={labelSearchQuery}
                                    onChangeText={setLabelSearchQuery}
                                    placeholder="Search labels"
                                    placeholderTextColor={palette.icon}
                                    autoCapitalize="none"
                                    keyboardType="default"
                                    returnKeyType="search"
                                  />
                                  <MaterialCommunityIcons name="magnify" size={18} color={palette.icon} />
                                </View>
                                {localFilters.selectedLabels.length > 0 && (
                                  <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.tokenScrollRow}
                                    contentContainerStyle={styles.tokenScrollInner}
                                  >
                                    {localFilters.selectedLabels.map((label) => (
                                      <View
                                        key={label}
                                        style={[
                                          styles.tokenChip,
                                          { backgroundColor: `${palette.tint}18`, borderColor: palette.border },
                                        ]}
                                      >
                                        <ThemedText style={[styles.tokenChipText, { color: palette.text }]}>
                                          {label}
                                        </ThemedText>
                                        <TouchableOpacity
                                          onPress={() =>
                                            setLocalFilters((prev) => ({
                                              ...prev,
                                              selectedLabels: (prev.selectedLabels ?? []).filter((item) => item !== label),
                                            }))
                                          }
                                          style={styles.tokenRemoveButton}
                                        >
                                          <MaterialCommunityIcons name="close" size={14} color={palette.icon} />
                                        </TouchableOpacity>
                                      </View>
                                    ))}
                                  </ScrollView>
                                )}
                                {(() => {
                                  const availableLabels = filteredLabelSuggestions.filter(
                                    (lab) => !localFilters.selectedLabels.includes(lab),
                                  );
                                  if (availableLabels.length === 0) {
                                    return (
                                      <ThemedText style={{ color: palette.icon }}>
                                        {labelSearchQuery.trim().length > 0
                                          ? 'No labels match your search'
                                          : 'No labels found'}
                                      </ThemedText>
                                    );
                                  }
                                  return (
                                  <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.tokenScrollInner}
                                  >
                                    {availableLabels.map((lab) => {
                                      const isActiveLabel = localFilters.selectedLabels.includes(lab);
                                      return (
                                        <TouchableOpacity
                                          key={lab}
                                          style={[
                                            styles.suggestionChip,
                                            isActiveLabel
                                              ? { backgroundColor: `${palette.tint}18`, borderColor: palette.tint }
                                              : { backgroundColor: palette.highlight, borderColor: palette.border },
                                          ]}
                                          onPress={() =>
                                            setLocalFilters((prev) => {
                                              const current = prev.selectedLabels ?? [];
                                              if (current.includes(lab)) {
                                                return {
                                                  ...prev,
                                                  selectedLabels: current.filter((item) => item !== lab),
                                                };
                                              }
                                              return { ...prev, selectedLabels: [...current, lab] };
                                            })
                                          }
                                          activeOpacity={0.85}
                                        >
                                          <ThemedText
                                            style={[
                                              styles.tokenChipText,
                                              { color: isActiveLabel ? palette.tint : palette.text },
                                            ]}
                                          >
                                            {lab}
                                          </ThemedText>
                                        </TouchableOpacity>
                                      );
                                    })}
                                  </ScrollView>
                                  );
                                })()}
                              </View>
                            )}
                            {section.id === 'keyTerms' && isExpanded && (
                              <View style={[styles.tokenInputSection, { marginTop: Spacing.md }]}>
                                <View
                                  style={[
                                    styles.tokenInputRow,
                                    { borderColor: palette.border, backgroundColor: palette.surface },
                                  ]}
                                >
                                  <TextInput
                                    style={[styles.tokenInput, { color: palette.text }]}
                                    value={keyTermInput}
                                    onChangeText={handleKeyTermInputChange}
                                    onBlur={finalizeKeyTermInput}
                                    onSubmitEditing={finalizeKeyTermInput}
                                    placeholder={t('key_terms_placeholder')}
                                    placeholderTextColor={palette.icon}
                                    autoCapitalize="none"
                                    keyboardType="default"
                                    returnKeyType="done"
                                  />
                                  <MaterialCommunityIcons name="magnify" size={18} color={palette.icon} />
                                </View>
                                <View style={styles.infoRow}>
                                  <MaterialCommunityIcons name="information-outline" size={14} color={palette.icon} />
                                  <ThemedText style={[styles.infoText, { color: palette.icon }]}>
                                    Searches notes, labels, payers, and titles.
                                  </ThemedText>
                                </View>
                                {localFilters.keyTerms.length > 0 && (
                                  <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.tokenScrollRow}
                                    contentContainerStyle={styles.tokenScrollInner}
                                  >
                                    {localFilters.keyTerms.map((term) => (
                                      <View
                                        key={term}
                                        style={[
                                          styles.tokenChip,
                                          { backgroundColor: `${palette.tint}18`, borderColor: palette.border },
                                        ]}
                                      >
                                        <ThemedText style={[styles.tokenChipText, { color: palette.text }]}>
                                          {term}
                                        </ThemedText>
                                        <TouchableOpacity
                                          onPress={() => handleRemoveKeyTerm(term)}
                                          style={styles.tokenRemoveButton}
                                        >
                                          <MaterialCommunityIcons name="close" size={14} color={palette.icon} />
                                        </TouchableOpacity>
                                      </View>
                                    ))}
                                  </ScrollView>
                                )}
                              </View>
                            )}
                            {section.id === 'amount' && isExpanded && (
                              <View style={{ marginTop: Spacing.md }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                  <ThemedText style={{ color: palette.text, fontSize: FontSizes.sm }}>
                                    {`$${Math.round(localMinAmount).toLocaleString()}`}
                                  </ThemedText>
                                  <ThemedText style={{ color: palette.text, fontSize: FontSizes.sm }}>
                                    {`$${Math.round(localMaxAmount).toLocaleString()}`}
                                  </ThemedText>
                                </View>
                                <DualSlider
                                  min={0}
                                  max={maxTransactionAbs}
                                  step={1}
                                  values={[localMinAmount, localMaxAmount]}
                                  onValuesChange={(vals) => {
                                    setLocalMinAmount(vals[0]);
                                    setLocalMaxAmount(vals[1]);
                                  }}
                                  onValuesChangeFinish={(vals) => {
                                    setLocalFilters((prev) => ({
                                      ...prev,
                                      amountRange: {
                                        min: Math.round(vals[0]),
                                        max: Math.round(vals[1]),
                                      },
                                    }));
                                  }}
                                  containerStyle={{ marginTop: Spacing.sm }}
                                  trackStyle={{ backgroundColor: palette.border }}
                                  selectedTrackStyle={{ backgroundColor: palette.tint }}
                                  markerStyle={{
                                    backgroundColor: palette.tint,
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    borderColor: palette.card,
                                  }}
                                />
                              </View>
                            )}
                          </View>
                          <MaterialCommunityIcons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={22}
                            color={palette.icon}
                          />
                        </View>
                      </TouchableOpacity>
                    )}
                      {section.id !== 'accounts' && (
                      <View style={[styles.separator, { backgroundColor: palette.border }]} />
                    )}
                  </View>
                );
                })}
              </ScrollView>
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: accent }]}
                onPress={() => {
                  const appliedPayers = finalizePayerInput();
                  const appliedKeyTerms = finalizeKeyTermInput();
                  const appliedLabels = localFilters.selectedLabels;
                  const appliedAccount = localFilters.selectedAccount;
                  const appliedAmountRange = localFilters.amountRange;
                  const appliedDateRange = localFilters.dateRange;
                  const appliedRecordType = localFilters.selectedRecordType;
                  const appliedPreset = localFilters.datePreset ?? (appliedDateRange ? 'custom' : null);
                  const appliedCategories = filters.tempSelectedCategories ?? [];
                  setSelectedPayers(appliedPayers);
                  setSelectedLabels(appliedLabels);
                  setKeyTerms(appliedKeyTerms);
                  setSelectedCategories(appliedCategories);
                  setTempSelectedCategories(appliedCategories);
                  setSelectedAccount(appliedAccount);
                  setAmountRange(appliedAmountRange);
                  applyDateFilter(appliedDateRange, appliedPreset);
                  onRecordTypeChange(appliedRecordType);
                  onClose();
                }}
              >
                <ThemedText style={{ color: 'white', fontWeight: '700' }}>APPLY</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Portal.Host>
      </Modal>

      <Modal
        transparent
        visible={showCalendarModal}
        animationType="fade"
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowCalendarModal(false)}
          />
          <View style={[styles.calendarSheet, { backgroundColor: palette.card, borderColor: palette.border }]}>
            {calendarMode === 'presets' ? (
              <>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
                    <MaterialCommunityIcons name="close" size={24} color={palette.icon} />
                  </TouchableOpacity>
                  <ThemedText style={[styles.calendarTitle, { color: palette.text }]}>
                    Select Time Period
                  </ThemedText>
                  <View style={{ width: 24 }} />
                </View>
                <View style={styles.calendarPresetList}>
                  <TouchableOpacity
                    style={[styles.presetButton, { borderColor: palette.border }]}
                    onPress={() => quickSelect('week')}
                  >
                    <ThemedText style={[styles.presetButtonText, { color: palette.text }]}>This Week</ThemedText>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={palette.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.presetButton, { borderColor: palette.border }]}
                    onPress={() => quickSelect('month')}
                  >
                    <ThemedText style={[styles.presetButtonText, { color: palette.text }]}>This Month</ThemedText>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={palette.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.presetButton, { borderColor: palette.border }]}
                    onPress={() => quickSelect('year')}
                  >
                    <ThemedText style={[styles.presetButtonText, { color: palette.text }]}>This Year</ThemedText>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={palette.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.presetButton, { borderColor: palette.border }]}
                    onPress={() => quickSelect('all')}
                  >
                    <ThemedText style={[styles.presetButtonText, { color: palette.text }]}>All Time</ThemedText>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={palette.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.presetButton, { borderColor: palette.border }]}
                    onPress={() => setCalendarMode('custom')}
                  >
                    <ThemedText style={[styles.presetButtonText, { color: palette.text }]}>Custom</ThemedText>
                    <MaterialCommunityIcons name="calendar-range" size={20} color={accent} />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity onPress={() => setCalendarMode('presets')}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color={palette.icon} />
                  </TouchableOpacity>
                  <ThemedText style={[styles.calendarTitle, { color: palette.text }]}>Select Range</ThemedText>
                  <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
                    <MaterialCommunityIcons name="close" size={24} color={palette.icon} />
                  </TouchableOpacity>
                </View>
                <View style={styles.monthHeader}>
                  <TouchableOpacity onPress={() => setMonthCursor((prev) => addMonths(prev, -1))}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color={palette.icon} />
                  </TouchableOpacity>
                  <ThemedText style={[styles.monthTitle, { color: palette.text }]}>
                    {formatMonthTitle(monthCursor)}
                  </ThemedText>
                  <TouchableOpacity onPress={() => setMonthCursor((prev) => addMonths(prev, 1))}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={palette.icon} />
                  </TouchableOpacity>
                </View>
                <View style={styles.weekDayHeader}>
                  {WEEKDAY_LABELS.map((day) => (
                    <ThemedText key={day} style={[styles.weekDayLabel, { color: palette.icon }]}>
                      {day}
                    </ThemedText>
                  ))}
                </View>
                <View style={styles.calendarGrid}>
                  {monthMatrix.map((week, index) => (
                    <View key={`week-${index}`} style={styles.weekRow}>
                      {week.map((day) => {
                        const inCurrentMonth = day.getMonth() === monthCursor.getMonth();
                        const isSelected =
                          draftRange &&
                          ((draftRange.start && isSameDay(draftRange.start, day)) ||
                            (draftRange.end && isSameDay(draftRange.end, day)));
                        const withinDraftRange = isWithinDraftRange(day);
                        const isFutureDay = startOfDay(day) > today;
                        const textColor = !inCurrentMonth
                          ? palette.icon
                          : isFutureDay
                            ? palette.icon
                            : palette.text;
                        return (
                          <TouchableOpacity
                            key={day.toISOString()}
                            style={[
                              styles.dayCell,
                              {
                                backgroundColor: !inCurrentMonth
                                  ? 'transparent'
                                  : withinDraftRange
                                    ? `${palette.tint}20`
                                    : 'transparent',
                                borderWidth: isSelected ? 1 : 0,
                                borderColor: isSelected ? palette.tint : 'transparent',
                              },
                              isFutureDay && styles.disabledDayCell,
                            ]}
                            onPress={() => handleDayPress(day)}
                            disabled={isFutureDay}
                            accessibilityState={isFutureDay ? { disabled: true } : undefined}
                          >
                            <ThemedText style={[styles.dayText, { color: textColor }]}>
                              {day.getDate()}
                            </ThemedText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
                <View style={styles.calendarHintRow}>
                  <MaterialCommunityIcons name="information-outline" size={14} color={palette.icon} />
                  <ThemedText style={[styles.calendarHintText, { color: palette.icon }]}>
                    Future dates can’t be selected. Latest available day is today.
                  </ThemedText>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: Spacing.lg, gap: Spacing.md }}>
                  <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
                    <ThemedText style={{ color: palette.icon, fontWeight: '600' }}>Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleConfirmRange}>
                    <ThemedText style={{ color: accent, fontWeight: '600' }}>Apply</ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const formatTimePeriod = (range: DateRange | null) => {
  const relativeLabel = getRelativePeriodLabel(range);
  if (relativeLabel) {
    return relativeLabel;
  }
  if (!range) {
    return 'All Time';
  }
  const start = range.start;
  const end = range.end;
  const diffDays = Math.ceil((startOfDay(end).getTime() - startOfDay(start).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) {
    const startDay = start.toLocaleDateString('en-US', { weekday: 'short' });
    const endDay = end.toLocaleDateString('en-US', { weekday: 'short' });
    return `${startDay} - ${endDay}`;
  }
  if (diffDays <= 31) {
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return `${startMonth} - ${endMonth}`;
  }
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
};
