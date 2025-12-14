import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCategoryDefinition, getFullCategoryLabel } from '@/constants/categories';
import { Colors, Spacing } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StorageService } from '@/services/storage';
import { getCustomHeaderStyles } from '@/styles/custom-header.styles';
import { logExpensesStyles } from '@/styles/log-expenses.styles';
import { SingleDraft } from '@/types/transactions';
import { emitRecordDetailUpdate, subscribeToCategorySelection } from '@/utils/navigation-events';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const styles = logExpensesStyles;

export const options = {
  headerShown: false,
  headerTitle: 'record_details',
};

type DraftErrors = {
  amount?: string;
  note?: string;
};

type PickerMode = 'date' | 'time' | null;

export default function RecordDetailScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const returnTo = useMemo(() => (typeof params.returnTo === 'string' ? params.returnTo : undefined), [params.returnTo]);
  const { showToast } = useToast();
  const allowDateEditing = returnTo !== 'log-expenses-list';
    const customHeaderStyles = useMemo(() => getCustomHeaderStyles(palette), [palette]);

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
  const labelInputRef = useRef<TextInput>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const focusLabelInput = useCallback(() => {
    setTimeout(() => labelInputRef.current?.focus(), 60);
  }, []);

  const openLabelInput = useCallback(() => {
    setShowLabelInput(true);
    focusLabelInput();
  }, [focusLabelInput]);

  const closeLabelInput = useCallback(() => {
    setShowLabelInput(false);
    setCurrentLabelInput('');
    labelInputRef.current?.blur();
  }, []);

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
      closeLabelInput();
      return;
    }

    setDraft((prev) => {
      const labels = Array.isArray(prev.labels) ? prev.labels : [];
      if (labels.includes(trimmed)) {
        return prev;
      }
      return {
        ...prev,
        labels: [...labels, trimmed],
      };
    });
    closeLabelInput();
  }, [closeLabelInput, currentLabelInput]);

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
      nextErrors.amount = t('amount_is_required');
    } else if (Number.isNaN(amountValue) || !Number.isFinite(amountValue)) {
      nextErrors.amount = t('enter_valid_number');
    } else if (amountValue <= 0) {
      nextErrors.amount = t('amount_must_be_positive');
    }

    if (!draft.note.trim()) {
      nextErrors.note = t('note_is_required');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [draft.amount, draft.note]);

  const isDraftEdited = useCallback(() => {
    const keys: (keyof SingleDraft)[] = ['amount', 'note', 'category', 'subcategoryId', 'payee', 'occurredAt', 'labels'];
    for (const key of keys) {
      const a = (initialDraft as any)[key];
      const b = (draft as any)[key];
      if (key === 'labels') {
        const la = Array.isArray(a) ? a : [];
        const lb = Array.isArray(b) ? b : [];
        if (la.length !== lb.length || la.some((value, index) => value !== lb[index])) {
          return true;
        }
      } else if ((a ?? '') !== (b ?? '')) {
        return true;
      }
    }
    return false;
  }, [initialDraft, draft]);

  const handleSave = useCallback(async () => {
    if (!validate()) {
      showToast(t('fix_errors_to_continue'), { tone: 'error' });
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
          title: nextDraft.note ?? t('transaction'),
          payee: nextDraft.payee ?? '',
          categoryId: nextDraft.category ?? undefined,
          subcategoryId: nextDraft.subcategoryId ?? undefined,
          labels: nextDraft.labels ?? undefined,
          date: nextDraft.occurredAt ?? recordDate.toISOString(),
        };
        await StorageService.updateTransaction(existingId, updates);
        showToast(t('record_updated'));
      } catch (err) {
        console.error('Failed to persist record changes:', err);
        showToast(t('failed_to_save_record'), { tone: 'error' });
      }
      navigation.goBack();
      return;
    }

    emitRecordDetailUpdate({
      target: 'log-expenses-list',
      recordIndex,
      record: nextDraft,
    });
    showToast(t('record_updated'));
    navigation.goBack();
  }, [draft, navigation, recordDate, recordIndex, showToast, validate]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    // Cleanup listeners on component unmount
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (returnTo !== 'log-expenses-list') {
        return;
      }
      if (!isDraftEdited()) {
        return;
      }

      e.preventDefault();
      Alert.alert(
        t('discard_changes'),
        t('discard_changes_confirm'),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('discard'),
            style: 'destructive',
            onPress: () => {
              navigation.dispatch(e.data.action);
            },
          },
        ],
        { cancelable: true }
      );
    });

    return unsubscribe;
  }, [navigation, isDraftEdited, returnTo]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.card }]}>
       <View style={customHeaderStyles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={palette.icon} />
        </TouchableOpacity>
        <ThemedText style={{ fontSize: 18, flex: 1, fontWeight: '600', color: palette.text }}>
          {t("record_details")}
        </ThemedText>
        <TouchableOpacity onPress={handleSave} style={{ padding: 8 }}>
          <MaterialCommunityIcons name="check" size={24} color={palette.tint} />
        </TouchableOpacity>
        
      </View>
      <KeyboardAvoidingView
                    behavior="padding"
                    style={styles.keyboardWrapper}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
                  >
        <View style={[{ flex: 1, height: '100%', display: 'flex', backgroundColor: palette.background }]}>
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
                <ThemedText style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}>{t('amount')}</ThemedText>
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
              <View style={[styles.inputWrapper, styles.inputBase, { borderColor: palette.border, backgroundColor: palette.card }]}>
                <ThemedText style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}>{t('category')}</ThemedText>
                <TouchableOpacity
                  style={[styles.categoryPill, { borderWidth: 0, backgroundColor: 'transparent' }]}
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
                  <View
                    style={[
                      styles.categoryIconBadge,
                      { backgroundColor: `${getCategoryDefinition(draft.category)?.color ?? palette.tint}22` },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={(getCategoryDefinition(draft.category)?.icon as any) ?? 'shape-outline'}
                      size={16}
                      color={getCategoryDefinition(draft.category)?.color ?? palette.tint}
                    />
                  </View>
                  <View style={styles.categoryTextWrapper}>
                    <ThemedText style={[styles.categoryLabel, { color: palette.text }]} numberOfLines={1}>
                      {getFullCategoryLabel(draft.category, draft.subcategoryId) || t('select_category')}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {returnTo !== 'log-expenses-list' && (
              <View style={styles.fieldGroup}>
                <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card }]}>
                  <ThemedText style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}>
                    {recordType === 'income' ? t('payer') : t('payee')}
                  </ThemedText>
                  <TextInput
                    style={[styles.notchedInput, { color: palette.text }]}
                    placeholder={recordType === 'income' ? t('eg_company_x') : t('eg_grocery_store')}
                    placeholderTextColor={palette.icon}
                    value={draft.payee}
                    onChangeText={(value) => setDraft((prev) => ({ ...prev, payee: value }))}
                  />
                </View>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card }]}>
                <ThemedText style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}>{t('note')}</ThemedText>
                <TextInput
                  style={[styles.notchedInput, { color: palette.text }]}
                  placeholder={t('add_a_note')}
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
                <ThemedText style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}>{t('labels')}</ThemedText>
                <Pressable
                  style={({ pressed }) => [styles.labelsSummaryRow, pressed && styles.labelsSummaryRowPressed]}
                  onPress={openLabelInput}
                >
                  <ScrollView
                    horizontal
                    style={[styles.labelsScrollArea, { flex: 1 }]}
                    contentContainerStyle={styles.labelsScrollInner}
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {(draft.labels ?? []).map((label) => (
                      <Pressable
                        key={label}
                        onPress={(event) => event.stopPropagation()}
                        style={({ pressed }) => [
                          styles.labelChip,
                          { backgroundColor: palette.highlight, borderColor: palette.border },
                          pressed && styles.labelChipPressed,
                        ]}
                      >
                        <ThemedText style={[styles.labelText, { color: palette.text }]}>{label}</ThemedText>
                        <TouchableOpacity
                          onPress={(event) => {
                            event.stopPropagation();
                            removeLabel(label);
                          }}
                          style={styles.removeLabelButton}
                        >
                          <MaterialCommunityIcons name="close" size={16} color={palette.icon} />
                        </TouchableOpacity>
                      </Pressable>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={[styles.labelActionPill, { borderColor: palette.border, backgroundColor: palette.card }]}
                    onPress={(event) => {
                      event.stopPropagation();
                      openLabelInput();
                    }}
                    accessibilityLabel={t('add_label')}
                  >
                    <MaterialCommunityIcons name="plus" size={16} color={palette.tint} />
                  </TouchableOpacity>
                </Pressable>
              </View>
            </View>

            {showLabelInput && (
              <View style={styles.sharedLabelInputRow}>
                <View style={styles.sharedLabelInputContainer}>
                  <TextInput
                    ref={labelInputRef}
                    style={[styles.sharedLabelInput, { backgroundColor: palette.card, color: palette.text }]}
                    placeholder={t('add_label')}
                    placeholderTextColor={palette.icon}
                    value={currentLabelInput}
                    onChangeText={setCurrentLabelInput}
                    onSubmitEditing={addLabel}
                    autoFocus
                  />
                  <View
                    style={[
                      styles.sharedLabelActions,
                      { backgroundColor: palette.card, borderColor: palette.border, borderLeftWidth: 1 },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={closeLabelInput}
                      style={[styles.sharedLabelActionButton, styles.sharedLabelCloseButton]}
                      accessibilityLabel={t('cancel_label_entry')}
                    >
                      <MaterialCommunityIcons name="close" size={18} color={palette.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={addLabel}
                      style={[styles.sharedLabelActionButton, styles.sharedLabelCheckButton]}
                      accessibilityLabel={t('save_label')}
                    >
                      <MaterialCommunityIcons name="check" size={20} color={palette.tint} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {allowDateEditing && (
              <View style={[styles.fieldGroup, showLabelInput && { marginTop: Spacing.md }]}>
                <View style={styles.dateTimeRow}>
                  <View
                    style={[styles.inputWrapper, styles.dateInputWrapper, { borderColor: palette.border, backgroundColor: palette.card, flex: 1 }]}
                  >
                    <ThemedText style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}>{t('date')}</ThemedText>
                    <TouchableOpacity
                      style={[styles.inputBase, styles.dateTimeButton, styles.dateTimeButtonInput]}
                      onPress={() => setPickerMode('date')}
                    >
                      <MaterialCommunityIcons name="calendar" size={18} color={palette.tint} />
                      <ThemedText style={[styles.dateTimeText, { color: palette.text }]}>{formattedDate}</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={[styles.inputWrapper, styles.dateInputWrapper, { borderColor: palette.border, backgroundColor: palette.card, flex: 1 }]}
                  >
                    <ThemedText style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}>{t('time')}</ThemedText>
                    <TouchableOpacity
                      style={[styles.inputBase, styles.dateTimeButton, styles.dateTimeButtonInput]}
                      onPress={() => setPickerMode('time')}
                    >
                      <MaterialCommunityIcons name="clock-outline" size={18} color={palette.tint} />
                      <ThemedText style={[styles.dateTimeText, { color: palette.text }]}>{formattedTime}</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </ThemedView>

          {allowDateEditing && pickerMode ? (
            <View style={[styles.pickerContainer, { borderColor: palette.border, backgroundColor: palette.card }]}>
              <DateTimePicker
                value={recordDate}
                mode={pickerMode}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateTimeChange}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity style={styles.pickerDoneButton} onPress={() => setPickerMode(null)}>
                  <ThemedText style={{ color: palette.tint }}>{t('done')}</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
          </ScrollView>
          {!isKeyboardVisible &&
            <View
              style={[styles.bottomActionBar, { borderTopColor: palette.border, backgroundColor: palette.background }]}
            >
              <TouchableOpacity
                onPress={() => handleSave()}
                style={[styles.primaryActionButton, { backgroundColor: palette.tint }]}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t('save_record')}
              >
                <ThemedText style={[styles.primaryActionLabel, { color: '#FFFFFF' }]}>{t('save')}</ThemedText>
              </TouchableOpacity>
            </View>}
        </View>
       
        </KeyboardAvoidingView>
    </SafeAreaView>
   
  );
}
