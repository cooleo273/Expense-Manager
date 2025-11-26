import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountDropdown } from '@/components/AccountDropdown';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCategoryDefinition } from '@/constants/categories';
import { getAccountMeta, mockAccounts } from '@/constants/mock-data';
import { Colors, Spacing } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StorageService } from '@/services/storage';
import { logExpensesStyles } from '@/styles/log-expenses.styles';
import { RecordType, SingleDraft } from '@/types/transactions';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const styles = logExpensesStyles;

type ReviewPayload = {
  records: SingleDraft[];
  accountId: string | null;
  accountName?: string;
  transactionType: RecordType;
};

type PickerMode = 'date' | 'time' | null;

type ParsedParams = {
  payload?: string | string[];
};

const parsePayload = (raw: string | null | undefined): ReviewPayload | null => {
  if (!raw) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as Partial<ReviewPayload>;
    if (!parsed.records || !Array.isArray(parsed.records) || parsed.records.length === 0) {
      return null;
    }

    return {
      records: parsed.records.map((record) => ({
        amount: record.amount ?? '',
        category: record.category ?? '',
        subcategoryId: record.subcategoryId ?? '',
        payee: record.payee ?? '',
        note: record.note ?? '',
        labels: Array.isArray(record.labels) ? record.labels : [],
        occurredAt: typeof record.occurredAt === 'string' ? record.occurredAt : undefined,
      })),
      accountId: parsed.accountId ?? null,
      accountName: parsed.accountName,
      transactionType: parsed.transactionType === 'income' ? 'income' : 'expense',
    };
  } catch (error) {
    console.error('Failed to parse review payload:', error);
    return null;
  }
};

export const options = {
  headerShown: true,
  headerTitle: '',
};

export default function LogExpensesReviewScreen() {
  const params = useLocalSearchParams<ParsedParams>();
  const payloadKey = Array.isArray(params.payload) ? params.payload[0] ?? '' : params.payload ?? '';
  const payload = useMemo(() => parsePayload(payloadKey), [payloadKey]);

  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const navigation = useNavigation();
  const router = useRouter();
  const { showToast } = useToast();
  const { setSelectedAccount } = useFilterContext();

  const fallbackAccount = useMemo(() => mockAccounts.find((acc) => acc.id !== 'all') ?? null, []);
  const [localAccountId, setLocalAccountId] = useState<string | null>(() => payload?.accountId ?? fallbackAccount?.id ?? null);
  const accountMeta = useMemo(() => getAccountMeta(localAccountId ?? '') ?? (localAccountId ? null : fallbackAccount), [fallbackAccount, localAccountId]);
  const accountName = accountMeta?.name ?? payload?.accountName ?? 'Select account';
  const transactionType = payload?.transactionType ?? 'expense';

  const [reviewRecords, setReviewRecords] = useState<SingleDraft[]>(() => payload?.records ?? []);
  const [recordDate, setRecordDate] = useState<Date>(() => {
    const source = payload?.records?.[0]?.occurredAt;
    if (source) {
      const parsed = new Date(source);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return new Date();
  });
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [currentLabelInput, setCurrentLabelInput] = useState('');
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const headerClearedRef = useRef(false);

  const handlePersist = useCallback(
    async (stayOnScreen: boolean) => {
      if (!payload || reviewRecords.length === 0) {
        showToast('Nothing to save', { tone: 'error' });
        return;
      }

      const resolvedAccountId = localAccountId ?? payload.accountId ?? fallbackAccount?.id;
      if (!resolvedAccountId) {
        Alert.alert('Account required', 'Please select an account before saving.');
        return;
      }

      const resolvedAccountName = getAccountMeta(resolvedAccountId)?.name ?? accountName;

      const invalidRecord = reviewRecords.find((record) => {
        const amount = Number(record.amount);
        const hasCategory = !!record.category && record.category.trim().length > 0;
        return !Number.isFinite(amount) || amount <= 0 || !hasCategory;
      });

      if (invalidRecord) {
        Alert.alert('Invalid record', 'One or more records are missing required information.');
        return;
      }

      try {
        const timestamp = recordDate.getTime();
        await StorageService.addBatchTransactions(
          reviewRecords.map((record, idx) => {
            const amount = Number(record.amount);
            const normalized = transactionType === 'expense' ? -Math.abs(amount) : Math.abs(amount);
            const candidateDate = record.occurredAt ? new Date(record.occurredAt) : null;
            const resolvedDate = candidateDate && !Number.isNaN(candidateDate.getTime())
              ? candidateDate
              : new Date(timestamp + idx);
            const occurredAt = resolvedDate.toISOString();

            return {
              id: `${timestamp}-${idx}`,
              title: record.note || 'Transaction',
              account: resolvedAccountName,
              accountId: resolvedAccountId,
              note: record.note,
              amount: normalized,
              date: occurredAt,
              type: transactionType,
              icon: 'cash',
              categoryId: record.category,
              subcategoryId: record.subcategoryId,
              labels: record.labels,
              userId: 'default-user',
            };
          })
        );

        showToast(`Added ${reviewRecords.length} record${reviewRecords.length > 1 ? 's' : ''}`);
        try {
          await Promise.all(
            reviewRecords.map((record) =>
              StorageService.incrementCategoryUsage(record.subcategoryId || record.category)
            )
          );
        } catch (err) {
          console.error('Failed to increment category usage for batch', err);
        }

        if (stayOnScreen) {
          Alert.alert('Saved', `${reviewRecords.length} record${reviewRecords.length > 1 ? 's' : ''} stored.`);
          return;
        }

        setSelectedAccount('all');
        router.replace('/(tabs)/records');
      } catch (error) {
        console.error('Failed to save batch records', error);
        Alert.alert('Error', 'Failed to save these records. Please try again.');
      }
    },
    [accountName, fallbackAccount, localAccountId, payload, recordDate, reviewRecords, router, setSelectedAccount, showToast, transactionType]
  );
    const handlePersistRef = useRef(handlePersist);
    useEffect(() => {
      handlePersistRef.current = handlePersist;
    }, [handlePersist]);

  useEffect(() => {
    if (!payload) {
      if (!headerClearedRef.current) {
        navigation.setOptions({ headerLeft: () => null, headerRight: () => null, headerTitle: '' });
        headerClearedRef.current = true;
      }
      return;
    }

    headerClearedRef.current = false;

    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 8 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={palette.icon} />
          </TouchableOpacity>
          <AccountDropdown
            allowAll={false}
            useGlobalState={false}
            onSelect={setLocalAccountId}
            selectedId={localAccountId ?? undefined}
          />
        </View>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => handlePersistRef.current(false)} style={{ padding: 8, marginRight: 8 }}>
            <MaterialCommunityIcons name="check" size={24} color={palette.tint} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowMenu(true)} style={{ padding: 8 }}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color={palette.icon} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [localAccountId, navigation, palette.icon, palette.tint, payload]);

  useEffect(() => {
    if (!payload || !payload.records || payload.records.length === 0) {
      setReviewRecords((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    const normalized = payload.records.map((record) => ({
      ...record,
      labels: Array.isArray(record.labels)
        ? record.labels
            .map((label) => (typeof label === 'string' ? label.trim() : ''))
            .filter((label): label is string => Boolean(label))
        : [],
    }));
    setReviewRecords(normalized);
    setShowLabelInput(false);
    setCurrentLabelInput('');

    const firstOccurred = normalized[0]?.occurredAt;
    if (firstOccurred) {
      const parsed = new Date(firstOccurred);
      if (!Number.isNaN(parsed.getTime())) {
        setRecordDate(parsed);
        return;
      }
    }
    setRecordDate(new Date());
  }, [payload]);

  const sharedLabels = useMemo(() => {
    if (reviewRecords.length === 0) {
      return [] as string[];
    }

    const normalizeLabels = (labels: unknown): string[] => {
      if (!Array.isArray(labels)) {
        return [];
      }
      return labels
        .map((label) => (typeof label === 'string' ? label.trim() : ''))
        .filter((label): label is string => Boolean(label));
    };

    const [first, ...rest] = reviewRecords;
    const intersection = new Set(normalizeLabels(first.labels));

    rest.forEach((record) => {
      const recordSet = new Set(normalizeLabels(record.labels));
      Array.from(intersection).forEach((label) => {
        if (!recordSet.has(label)) {
          intersection.delete(label);
        }
      });
    });

    return Array.from(intersection);
  }, [reviewRecords]);

  const individualLabelCount = useMemo(() => {
    if (reviewRecords.length === 0) {
      return 0;
    }

    return reviewRecords.reduce((count, record) => {
      const labels = Array.isArray(record.labels) ? record.labels : [];
      const trimmed = labels
        .map((label) => (typeof label === 'string' ? label.trim() : ''))
        .filter((label): label is string => Boolean(label) && !sharedLabels.includes(label));
      return count + trimmed.length;
    }, 0);
  }, [reviewRecords, sharedLabels]);

  const categoriesSummary = useMemo(() => {
    const orderedNames: string[] = [];
    const seen = new Set<string>();

    reviewRecords.forEach((record) => {
      const sourceId = record.subcategoryId || record.category;
      const definition = getCategoryDefinition(sourceId || record.category);
      const nameCandidate = definition?.name ?? record.category;
      const name = nameCandidate?.trim();
      if (!name) {
        return;
      }
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        orderedNames.push(name);
      }
    });

    if (orderedNames.length === 0) {
      return 'No categories';
    }
    if (orderedNames.length === 1) {
      return orderedNames[0];
    }
    if (orderedNames.length === 2) {
      return `${orderedNames[0]}, ${orderedNames[1]}`;
    }
    return `${orderedNames[0]}, ${orderedNames[1]} & ${orderedNames.length - 2} more`;
  }, [reviewRecords]);

  const primaryPayee = useMemo(() => {
    const withNames = reviewRecords.map((record) => record.payee?.trim()).filter(Boolean);
    return withNames[0] ?? '—';
  }, [reviewRecords]);

  const totalAmount = useMemo(() => {
    return reviewRecords.reduce((sum, record) => {
      const numeric = Number(record.amount);
      if (Number.isFinite(numeric)) {
        return sum + numeric;
      }
      return sum;
    }, 0);
  }, [reviewRecords]);

  const formattedTotal = useMemo(() => `$${totalAmount.toFixed(2)}`, [totalAmount]);
  const totalRecords = reviewRecords.length;

  const handleDateTimeChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      if (!selectedDate || !pickerMode) {
        if (Platform.OS !== 'ios') {
          setPickerMode(null);
        }
        return;
      }

      const next = new Date(recordDate);
      if (pickerMode === 'date') {
        next.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      } else {
        next.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      }

      setRecordDate(next);
      setReviewRecords((prev) =>
        prev.map((record, idx) => ({
          ...record,
          occurredAt: new Date(next.getTime() + idx).toISOString(),
        }))
      );

      if (Platform.OS !== 'ios') {
        setPickerMode(null);
      }
    },
    [pickerMode, recordDate]
  );

  const addSharedLabel = useCallback(() => {
    const trimmed = currentLabelInput.trim();
    if (!trimmed) {
      setShowLabelInput(false);
      setCurrentLabelInput('');
      return;
    }

    const normalized = trimmed.toLowerCase();
    const alreadyShared = sharedLabels.some((label) => label.trim().toLowerCase() === normalized);
    if (alreadyShared) {
      showToast('Label already added', { tone: 'warning' });
      setCurrentLabelInput('');
      setShowLabelInput(false);
      return;
    }

    setReviewRecords((prev) =>
      prev.map((record) => {
        const existing = Array.isArray(record.labels) ? record.labels : [];
        const hasLabel = existing.some((label) => label.trim().toLowerCase() === normalized);
        if (hasLabel) {
          return record;
        }
        return {
          ...record,
          labels: [...existing, trimmed],
        };
      })
    );

    setCurrentLabelInput('');
    setShowLabelInput(false);
  }, [currentLabelInput, sharedLabels, showToast]);

  const removeSharedLabel = useCallback((labelToRemove: string) => {
    setReviewRecords((prev) =>
      prev.map((record) => ({
        ...record,
        labels: (record.labels ?? []).filter((label) => label !== labelToRemove),
      }))
    );
  }, []);

  if (!payload || reviewRecords.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText style={{ color: palette.text, fontSize: 16 }}>Nothing to review.</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: Spacing.md }}>
          <ThemedText style={{ color: palette.tint }}>Go back</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const formattedDate = recordDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = recordDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.keyboardWrapper}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { backgroundColor: palette.background }]}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <ThemedView
            style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border, alignItems: 'center', gap: Spacing.md }]}
          >
            <ThemedText style={[styles.summaryLabel, { color: palette.icon }]}>Total Amount ({totalRecords} record{totalRecords > 1 ? 's' : ''})</ThemedText>
            <ThemedText style={[styles.summaryTotal, { color: palette.text }]}>{formattedTotal}</ThemedText>
          </ThemedView>

          <ThemedView
            style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <View style={styles.fieldGroup}>
              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card }]}>
                <ThemedText style={[styles.notchedLabel, { color: palette.icon, backgroundColor: palette.card }]}>Categories</ThemedText>
                <ThemedText style={[styles.notchedInput, { color: palette.text }]} numberOfLines={1} ellipsizeMode="tail">
                  {categoriesSummary}
                </ThemedText>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card }]}>
                <ThemedText style={[styles.notchedLabel, { color: palette.icon, backgroundColor: palette.card }]}>
                  {transactionType === 'income' ? 'Payer' : 'Payee'}
                </ThemedText>
                <ThemedText style={[styles.notchedInput, { color: palette.text }]} numberOfLines={1} ellipsizeMode="tail">
                  {primaryPayee}
                </ThemedText>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card }]}>
                <ThemedText style={[styles.notchedLabel, { color: palette.icon, backgroundColor: palette.card }]}>Labels</ThemedText>
                <View style={styles.labelsSummaryRow}>
                  <ScrollView
                    horizontal
                    style={[styles.labelsScrollArea, { flex: 1 }]}
                    contentContainerStyle={styles.labelsScrollInner}
                    showsHorizontalScrollIndicator={false}
                  >
                    <View
                      style={[styles.labelSummaryPill, { borderColor: palette.border, backgroundColor: palette.highlight }]}
                    >
                      <ThemedText style={[styles.labelText, { color: palette.text }]}>
                        {individualLabelCount > 0
                          ? `${individualLabelCount} Individual Label${individualLabelCount > 1 ? 's' : ''}`
                          : 'No Individual Labels'}
                      </ThemedText>
                    </View>
                    {sharedLabels.map((label) => (
                      <View
                        key={label}
                        style={[styles.labelChip, { backgroundColor: palette.highlight, borderColor: palette.border }]}
                      >
                        <ThemedText style={[styles.labelText, { color: palette.text }]}>{label}</ThemedText>
                        <TouchableOpacity onPress={() => removeSharedLabel(label)} style={styles.removeLabelButton}>
                          <MaterialCommunityIcons name="close" size={16} color={palette.icon} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={[styles.labelActionPill, { borderColor: palette.border, backgroundColor: palette.card }]}
                    onPress={() => {
                      setShowLabelInput(true);
                      setCurrentLabelInput('');
                    }}
                  >
                    <MaterialCommunityIcons name="plus" size={16} color={palette.tint} />
                    <ThemedText style={[styles.labelText, { color: palette.tint }]}>Add Label</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {showLabelInput && (
              <View style={styles.sharedLabelInputRow}>
                <View style={styles.sharedLabelInputContainer}>
                  <TextInput
                    style={[
                      styles.sharedLabelInput,
                      { backgroundColor: palette.card, color: palette.text },
                    ]}
                    placeholder="Add Label"
                    placeholderTextColor={palette.icon}
                    value={currentLabelInput}
                    onChangeText={setCurrentLabelInput}
                    onSubmitEditing={addSharedLabel}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={addSharedLabel}
                    style={styles.sharedLabelIconButton}
                  >
                    <MaterialCommunityIcons name="check" size={20} color={palette.tint} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={[styles.fieldGroup, showLabelInput && { marginTop: Spacing.md }]}>
              <View style={styles.dateTimeRow}>
                <View
                  style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card, flex: 1 }]}
                >
                  <ThemedText
                    style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}
                  >
                    Date
                  </ThemedText>
                  <TouchableOpacity
                    style={[styles.dateTimeButton, styles.dateTimeButtonInput, styles.inputBase]}
                    onPress={() => setPickerMode('date')}
                  >
                    <MaterialCommunityIcons name="calendar" size={18} color={palette.tint} />
                    <ThemedText style={[styles.dateTimeText, { color: palette.text }]}>{formattedDate}</ThemedText>
                  </TouchableOpacity>
                </View>
                <View
                  style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card, flex: 1 }]}
                >
                  <ThemedText
                    style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}
                  >
                    Time
                  </ThemedText>
                  <TouchableOpacity
                    style={[styles.dateTimeButton, styles.dateTimeButtonInput, styles.inputBase]}
                    onPress={() => setPickerMode('time')}
                  >
                    <MaterialCommunityIcons name="clock-outline" size={18} color={palette.tint} />
                    <ThemedText style={[styles.dateTimeText, { color: palette.text }]}>{formattedTime}</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ThemedView>

          {pickerMode ? (
            <View style={[styles.pickerContainer, { borderColor: palette.border, backgroundColor: palette.card }]}>
              <DateTimePicker
                value={recordDate}
                mode={pickerMode}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateTimeChange}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity style={styles.pickerDoneButton} onPress={() => setPickerMode(null)}>
                  <ThemedText style={{ color: palette.tint }}>Done</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View
            style={[styles.menuContainer, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
              <TouchableOpacity
                onPress={() => {
                  handlePersistRef.current(true);
                  setShowMenu(false);
                }}
              style={styles.menuItem}
            >
              <MaterialCommunityIcons name="content-save" size={20} color={palette.icon} />
              <ThemedText style={[styles.menuLabel, { color: palette.text }]}>Save and stay here</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Template saved', 'Batch saved as template for future use.');
                setShowMenu(false);
              }}
              style={styles.menuItem}
            >
              <MaterialCommunityIcons name="file-plus" size={20} color={palette.icon} />
              <ThemedText style={[styles.menuLabel, { color: palette.text }]}>Save template</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
