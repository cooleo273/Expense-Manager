import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getFullCategoryLabel } from '@/constants/categories';
import { Colors, Spacing } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StorageService } from '@/services/storage';
import { logExpensesStyles } from '@/styles/log-expenses.styles';
import { SingleDraft } from '@/types/transactions';
import { emitRecordDetailUpdate, subscribeToCategorySelection } from '@/utils/navigation-events';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const styles = logExpensesStyles;

export const options = {
  headerShown: true,
  headerTitle: 'Record Details',
};

type DraftErrors = {
  amount?: string;
  note?: string;
};

type PickerMode = 'date' | 'time' | null;

export default function RecordDetailScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { showToast } = useToast();

  const recordIndex = useMemo(() => {
    const indexParam = params.recordIndex;
    if (typeof indexParam === 'string') {
      const parsed = parseInt(indexParam, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }, [params.recordIndex]);

  const initialDraft = useMemo<SingleDraft>(() => {
    const payload = typeof params.payload === 'string' ? params.payload : undefined;
    if (payload) {
      try {
        const decoded = decodeURIComponent(payload);
        const parsed = JSON.parse(decoded);
        return {
          amount: typeof parsed.amount === 'number' ? String(Math.abs(parsed.amount)) : parsed.amount ?? '',
          category: parsed.category ?? 'foodAndDrinks',
          subcategoryId: parsed.subcategoryId,
          payee: parsed.payee ?? '',
          note: parsed.note ?? '',
          labels: Array.isArray(parsed.labels) ? parsed.labels : [],
          occurredAt:
            typeof parsed.occurredAt === 'string'
              ? parsed.occurredAt
              : parsed.date
                ? new Date(parsed.date).toISOString()
                : undefined,
        };
      } catch (error) {
        console.warn('Failed to hydrate record detail payload', error);
      }
    }
    return {
      amount: typeof params.amount === 'string' ? params.amount : '',
      category: typeof params.category === 'string' ? params.category : 'foodAndDrinks',
      subcategoryId: typeof params.subcategoryId === 'string' ? params.subcategoryId : undefined,
      payee: typeof params.payee === 'string' ? params.payee : '',
      note: typeof params.note === 'string' ? params.note : '',
      labels: [],
      occurredAt:
        typeof params.date === 'string'
          ? new Date(params.date).toISOString()
          : undefined,
    };
  }, [params.amount, params.category, params.note, params.payload, params.payee, params.subcategoryId]);

  const parsedPayload = useMemo(() => {
    const payloadStr = typeof params.payload === 'string' ? params.payload : undefined;
    if (!payloadStr) return undefined;
    try {
      return JSON.parse(decodeURIComponent(payloadStr));
    } catch (err) {
      return undefined;
    }
  }, [params.payload]);

  const recordType = useMemo(() => {
    if (typeof params.type === 'string') {
      return (params.type === 'income' ? 'income' : 'expense') as 'income' | 'expense';
    }
    if (parsedPayload && typeof parsedPayload.type === 'string') {
      return (parsedPayload.type === 'income' ? 'income' : 'expense') as 'income' | 'expense';
    }
    return undefined;
  }, [params.type, parsedPayload]);

  const initialDate = useMemo(() => {
    if (initialDraft.occurredAt) {
      const parsed = new Date(initialDraft.occurredAt);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return new Date();
  }, [initialDraft.occurredAt]);

  const [recordDate, setRecordDate] = useState<Date>(initialDate);
  const [draft, setDraft] = useState<SingleDraft>(() => ({
    ...initialDraft,
    labels: Array.isArray(initialDraft.labels) ? [...initialDraft.labels] : [],
    occurredAt: initialDate.toISOString(),
  }));
  const [errors, setErrors] = useState<DraftErrors>({});
  const [currentLabelInput, setCurrentLabelInput] = useState('');
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  useEffect(() => {
    const resolvedDate = (() => {
      if (initialDraft.occurredAt) {
        const parsed = new Date(initialDraft.occurredAt);
        if (!Number.isNaN(parsed.getTime())) {
          return parsed;
        }
      }
      return initialDate;
    })();

    setDraft({
      ...initialDraft,
      labels: Array.isArray(initialDraft.labels) ? [...initialDraft.labels] : [],
      occurredAt: resolvedDate.toISOString(),
    });
    setRecordDate(resolvedDate);
    setErrors({});
    setCurrentLabelInput('');
    setShowLabelInput(false);
  }, [initialDate, initialDraft]);

  useEffect(() => {
    const unsubscribe = subscribeToCategorySelection((payload) => {
      if (payload.target !== 'record-detail') {
        return;
      }
      if (typeof payload.recordIndex !== 'number' || payload.recordIndex !== recordIndex) {
        return;
      }
      setDraft((prev) => ({
        ...prev,
        category: payload.category,
        subcategoryId: payload.subcategoryId,
      }));
    });
    return unsubscribe;
  }, [recordIndex]);

  const addLabel = useCallback(() => {
    const trimmed = currentLabelInput.trim();
    if (!trimmed) {
      setShowLabelInput(false);
      setCurrentLabelInput('');
      return;
    }

    setDraft((prev) => {
      const labels = Array.isArray(prev.labels) ? prev.labels : [];
      if (labels.includes(trimmed)) {
        setShowLabelInput(false);
        setCurrentLabelInput('');
        return prev;
      }
      const next = {
        ...prev,
        labels: [...labels, trimmed],
      };
      setShowLabelInput(false);
      setCurrentLabelInput('');
      return next;
    });
  }, [currentLabelInput]);

  const removeLabel = useCallback((labelToRemove: string) => {
    setDraft((prev) => ({
      ...prev,
      labels: (prev.labels ?? []).filter((label) => label !== labelToRemove),
    }));
  }, []);

  const handleDateTimeChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      if (!selectedDate || !pickerMode) {
        if (Platform.OS !== 'ios') {
          setPickerMode(null);
        }
        return;
      }

      const nextDate = new Date(recordDate);
      if (pickerMode === 'date') {
        nextDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      } else {
        nextDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      }

      setRecordDate(nextDate);
      setDraft((prev) => ({
        ...prev,
        occurredAt: nextDate.toISOString(),
      }));

      if (Platform.OS !== 'ios') {
        setPickerMode(null);
      }
    },
    [pickerMode, recordDate]
  );

  const formattedDate = useMemo(
    () => recordDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    [recordDate]
  );

  const formattedTime = useMemo(
    () => recordDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    [recordDate]
  );

  const validate = useCallback(() => {
    const nextErrors: DraftErrors = {};
    const amountValue = Number(draft.amount.trim());
    if (!draft.amount.trim()) {
      nextErrors.amount = 'Amount is required';
    } else if (Number.isNaN(amountValue) || !Number.isFinite(amountValue)) {
      nextErrors.amount = 'Enter a valid number';
    } else if (amountValue <= 0) {
      nextErrors.amount = 'Amount must be greater than zero';
    }

    if (!draft.note.trim()) {
      nextErrors.note = 'Note is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [draft.amount, draft.note]);

  const handleSave = useCallback(async () => {
    if (!validate()) {
      showToast('Fix errors to continue', { tone: 'error' });
      return;
    }

    const nextDraft: SingleDraft = {
      ...draft,
      occurredAt: recordDate.toISOString(),
    };
    setDraft(nextDraft);

    const existingId = typeof params.id === 'string' ? params.id : undefined;
    if (existingId) {
      try {
        const numeric = Number(nextDraft.amount.trim());
        const signedAmount = recordType === 'expense' ? -Math.abs(numeric) : Math.abs(numeric);
        const updates: any = {
          amount: signedAmount,
          note: nextDraft.note ?? '',
          title: nextDraft.note ?? 'Transaction',
          payee: nextDraft.payee ?? '',
          categoryId: nextDraft.category ?? undefined,
          subcategoryId: nextDraft.subcategoryId ?? undefined,
          labels: nextDraft.labels ?? undefined,
          date: nextDraft.occurredAt ?? recordDate.toISOString(),
        };
        await StorageService.updateTransaction(existingId, updates);
        showToast('Record saved');
      } catch (err) {
        console.error('Failed to persist record changes:', err);
        showToast('Failed to save record', { tone: 'error' });
      }
      navigation.goBack();
      return;
    }

    emitRecordDetailUpdate({
      target: 'log-expenses-list',
      recordIndex,
      record: nextDraft,
    });
    showToast('Details updated');
    navigation.goBack();
  }, [draft, navigation, recordDate, recordIndex, showToast, validate]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Record Details',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={palette.icon} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={{ padding: 8 }}>
          <MaterialCommunityIcons name="check" size={24} color={palette.tint} />
        </TouchableOpacity>
      ),
    });
  }, [handleSave, navigation, palette.icon, palette.tint]);

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
          <ThemedView style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <View style={styles.fieldGroup}>
              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card }]}>
                <ThemedText style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}>Amount*</ThemedText>
                <View style={styles.amountRow}>
                  <ThemedText style={[styles.currencySymbol, { color: palette.icon }]}>$</ThemedText>
                  <TextInput
                    style={[styles.amountInput, { color: palette.text }]}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={palette.icon}
                    value={draft.amount}
                    onChangeText={(value) => setDraft((prev) => ({ ...prev, amount: value }))}
                  />
                </View>
              </View>
              {errors.amount ? (
                <ThemedText style={{ color: palette.error, fontSize: 12, marginTop: 4 }}>{errors.amount}</ThemedText>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card }]}>
                <ThemedText style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}>Category*</ThemedText>
                <TouchableOpacity
                  style={[styles.categoryInput, { borderWidth: 0, backgroundColor: 'transparent' }]}
                  onPress={() =>
                    router.push({
                      pathname: '/Category',
                      params: {
                        current: draft.category,
                        currentSubcategory: draft.subcategoryId,
                        returnTo: 'record-detail',
                        recordIndex: recordIndex.toString(),
                      },
                    })
                  }
                >
                  <ThemedText style={[styles.categoryText, { color: palette.text }]} numberOfLines={1}>
                    {getFullCategoryLabel(draft.category, draft.subcategoryId) || 'Select category'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card }]}>
                <ThemedText style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}>
                  {recordType === 'income' ? 'Payer' : 'Payee'}
                </ThemedText>
                <TextInput
                  style={[styles.notchedInput, { color: palette.text }]}
                  placeholder={recordType === 'income' ? 'Eg: Company X' : 'Eg: Grocery Store'}
                  placeholderTextColor={palette.icon}
                  value={draft.payee}
                  onChangeText={(value) => setDraft((prev) => ({ ...prev, payee: value }))}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card }]}>
                <ThemedText style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}>Note*</ThemedText>
                <TextInput
                  style={[styles.notchedInput, { color: palette.text }]}
                  placeholder="Add a note"
                  placeholderTextColor={palette.icon}
                  value={draft.note}
                  onChangeText={(value) => setDraft((prev) => ({ ...prev, note: value }))}
                />
              </View>
              {errors.note ? (
                <ThemedText style={{ color: palette.error, fontSize: 12, marginTop: 4 }}>{errors.note}</ThemedText>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card }]}>
                <ThemedText style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}>Labels</ThemedText>
                <View style={styles.labelsSummaryRow}>
                  <ScrollView
                    horizontal
                    style={[styles.labelsScrollArea, { flex: 1 }]}
                    contentContainerStyle={styles.labelsScrollInner}
                    showsHorizontalScrollIndicator={false}
                  >
                    {draft.labels?.map((label) => (
                      <View
                        key={label}
                        style={[styles.labelChip, { backgroundColor: palette.highlight, borderColor: palette.border }]}
                      >
                        <ThemedText style={[styles.labelText, { color: palette.text }]}>{label}</ThemedText>
                        <TouchableOpacity onPress={() => removeLabel(label)} style={styles.removeLabelButton}>
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
                    onSubmitEditing={addLabel}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={addLabel}
                    style={styles.sharedLabelIconButton}
                  >
                    <MaterialCommunityIcons name="check" size={20} color={palette.tint} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={[styles.fieldGroup, showLabelInput && { marginTop: Spacing.md }]}>
              <ThemedText style={[styles.fieldLabel, { color: palette.icon }]}>Date &amp; Time</ThemedText>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity
                  style={[styles.dateTimeButton, styles.dateTimeButtonOutlined, { borderColor: palette.border, backgroundColor: palette.card }]}
                  onPress={() => setPickerMode('date')}
                >
                  <MaterialCommunityIcons name="calendar" size={18} color={palette.tint} />
                  <ThemedText style={[styles.dateTimeText, { color: palette.text }]}>{formattedDate}</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dateTimeButton, styles.dateTimeButtonOutlined, { borderColor: palette.border, backgroundColor: palette.card }]}
                  onPress={() => setPickerMode('time')}
                >
                  <MaterialCommunityIcons name="clock-outline" size={18} color={palette.tint} />
                  <ThemedText style={[styles.dateTimeText, { color: palette.text }]}>{formattedTime}</ThemedText>
                </TouchableOpacity>
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
    </SafeAreaView>
  );
}
