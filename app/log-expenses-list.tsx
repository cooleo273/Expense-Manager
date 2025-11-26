import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, KeyboardAvoidingView,
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
import { getCategoryColor, getCategoryIcon, getFullCategoryLabel } from '@/constants/categories';
import { getAccountMeta, mockAccounts } from '@/constants/mock-data';
import { Colors } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { transactionDraftState } from '@/state/transactionDraftState';
import { logExpensesStyles } from '@/styles/log-expenses.styles';
import { ReceiptImportResult } from '@/types/receipt';
import { RecordType, SingleDraft } from '@/types/transactions';
import { subscribeToCategorySelection, subscribeToRecordDetailUpdates } from '@/utils/navigation-events';

type EditableDraftKey = 'amount' | 'category' | 'subcategoryId' | 'payee' | 'note';

const isReceiptImportResult = (payload: unknown): payload is ReceiptImportResult => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  const candidate = payload as { draftPatch?: unknown };
  return candidate.draftPatch !== undefined && candidate.draftPatch !== null && typeof candidate.draftPatch === 'object';
};

const isReceiptImportBatch = (payload: unknown): payload is { records: SingleDraft[] } => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  const candidate = payload as { records?: unknown };
  if (!Array.isArray(candidate.records) || candidate.records.length === 0) {
    return false;
  }
  return candidate.records.every((r) => r && typeof r === 'object');
};

export const options = {
  headerShown: true,
  headerTitle: 'Add Expenses List',
};

const styles = logExpensesStyles;

export default function LogExpensesListScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { showToast } = useToast();
  const { filters } = useFilterContext();

  const scrollViewRef = useRef<ScrollView>(null);
  const scanPrefillRef = useRef<string | null>(null);

  const scrollToInput = useCallback((yOffset: number) => {
    scrollViewRef.current?.scrollTo({ y: yOffset, animated: true });
  }, []);

  const fallbackAccount = useMemo(() => mockAccounts.find((acc) => acc.id !== 'all'), []);
  const [localSelectedAccount, setLocalSelectedAccount] = useState<string | null>(fallbackAccount?.id ?? null);
  const selectedAccountId = useMemo(() => {
    if (filters.selectedAccount && filters.selectedAccount !== 'all') {
      return filters.selectedAccount;
    }
    return localSelectedAccount ?? fallbackAccount?.id ?? 'rbc';
  }, [fallbackAccount, filters.selectedAccount]);
  const accountMeta = useMemo(() => getAccountMeta(selectedAccountId) ?? fallbackAccount, [selectedAccountId, fallbackAccount]);
  const accountName = accountMeta?.name ?? 'RBC Account';

  const transactionType: RecordType = params.type === 'income' ? 'income' : 'expense';

  const [records, setRecords] = useState<SingleDraft[]>([
    {
      amount: '',
      category: params.defaultCategory as string || (transactionType === 'income' ? 'income' : transactionDraftState.getLastSelectedCategory('expense')),
      subcategoryId: '',
      payee: '',
      note: '',
      labels: [],
    }
  ]);
  const [recordErrors, setRecordErrors] = useState<string[]>(['']);
  const [recordCategoryErrors, setRecordCategoryErrors] = useState<string[]>(['']);
  const [recordNoteErrors, setRecordNoteErrors] = useState<string[]>(['']);

  const updateRecord = useCallback((index: number, key: EditableDraftKey, value: string) => {
    setRecords(prev => prev.map((record, i) =>
      i === index ? { ...record, [key]: value } : record
    ));
    if (key === 'amount') {
      setRecordErrors(prev => prev.map((err, i) => i === index ? '' : err));
    }
    if (key === 'category') {
      setRecordCategoryErrors(prev => prev.map((err, i) => i === index ? '' : err));
    }
    if (key === 'note') {
      setRecordNoteErrors(prev => prev.map((err, i) => i === index ? '' : err));
    }
  }, []);

  const handleNoteChange = useCallback((index: number, value: string) => {
    updateRecord(index, 'note', value);
  }, [updateRecord]);

  const openRecordDetails = useCallback((index: number) => {
    const targetRecord = records[index];
    if (!targetRecord) {
      return;
    }
    const payload = encodeURIComponent(JSON.stringify(targetRecord));
    router.push({
      pathname: '/record-detail',
      params: {
        recordIndex: index.toString(),
        payload,
      },
    });
  }, [records, router]);

  const addRecord = useCallback(() => {
    setRecords(prev => [...prev, {
      amount: '',
      category: params.defaultCategory as string || '',
      subcategoryId: '',
      payee: '',
      note: '',
      labels: [],
    }]);
    setRecordErrors(prev => [...prev, '']);
    setRecordCategoryErrors(prev => [...prev, '']);
    setRecordNoteErrors(prev => [...prev, '']);
    showToast('Record added successfully');
  }, [params.defaultCategory, showToast]);

  const isRecordEdited = useCallback((record: SingleDraft) => {
    const amountSet = (record.amount ?? '').trim() !== '';
    const noteSet = (record.note ?? '').trim() !== '';
    const payeeSet = (record.payee ?? '').trim() !== '';
    const subcategorySet = !!record.subcategoryId;
    const categorySet = !!record.category;
    const labelsSet = Array.isArray(record.labels) && record.labels.length > 0;
    const occurredAtSet = !!record.occurredAt;

    // Avoid treating only default category as an edit. Category by itself is not an edit
    // unless any other field is set or a subcategory is chosen.
    const anyOther = amountSet || noteSet || payeeSet || subcategorySet || labelsSet || occurredAtSet;
    return anyOther || (categorySet && subcategorySet);
  }, []);

  const removeRecord = useCallback((index: number) => {
    if (records.length > 1) {
      setRecords(prev => prev.filter((_, i) => i !== index));
      setRecordErrors(prev => prev.filter((_, i) => i !== index));
      setRecordCategoryErrors(prev => prev.filter((_, i) => i !== index));
      setRecordNoteErrors(prev => prev.filter((_, i) => i !== index));
    }
  }, [records.length]);

  const confirmAndRemoveRecord = useCallback((index: number) => {
    const record = records[index];
    if (!record) {
      return;
    }

    if (!isRecordEdited(record)) {
      removeRecord(index);
      return;
    }

    Alert.alert(
      'Delete record',
      'This record has unsaved edits. Are you sure you want to delete it?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeRecord(index) },
      ],
      { cancelable: true }
    );
  }, [isRecordEdited, records, removeRecord]);

  const handleNext = useCallback(() => {
    let hasErrors = false;
    const amountErrors = records.map((record) => {
      const amountStr = record.amount.trim();
      if (!amountStr) {
        hasErrors = true;
        return 'Amount is required';
      }
      const numeric = Number(amountStr);
      if (isNaN(numeric) || !isFinite(numeric)) {
        hasErrors = true;
        return 'Amount must be a valid number';
      }
      if (numeric <= 0) {
        hasErrors = true;
        return 'Amount must be greater than 0';
      }
      return '';
    });
    const categoryErrors = records.map((record) => {
      if (!record.category || record.category.trim() === '') {
        hasErrors = true;
        return 'Category is required';
      }
      return '';
    });
    const noteErrors = records.map((record) => {
      if (!record.note || record.note.trim() === '') {
        hasErrors = true;
        return 'Note is required';
      }
      return '';
    });
    setRecordErrors(amountErrors);
    setRecordCategoryErrors(categoryErrors);
    setRecordNoteErrors(noteErrors);
    if (hasErrors) {
      showToast('Please fix the errors before proceeding', { tone: 'error' });
      return;
    }

    const payload = {
      records,
      accountId: selectedAccountId,
      accountName,
      transactionType,
    };

    router.push({
      pathname: '/log-expenses-review',
      params: {
        payload: encodeURIComponent(JSON.stringify(payload)),
      },
    });
  }, [accountName, records, router, selectedAccountId, showToast, transactionType]);

  useEffect(() => {
    const parsedParam = params.parsed;
    if (typeof parsedParam !== 'string' || parsedParam.length === 0) {
      scanPrefillRef.current = null;
      return;
    }
    if (scanPrefillRef.current === parsedParam) {
      return;
    }

    try {
      const decoded = decodeURIComponent(parsedParam);
      const payload = JSON.parse(decoded);
      if (isReceiptImportBatch(payload)) {
        const incoming = payload.records.map((r) => {
          const record = r as any;
          const amt = record.amount;
          const amount = typeof amt === 'number' ? amt.toFixed(2) : (typeof amt === 'string' ? amt : '');
          return {
            amount,
            category: record.category ?? '',
            subcategoryId: record.subcategoryId ?? '',
            payee: record.payee ?? '',
            note: record.note ?? '',
            occurredAt: typeof record.occurredAt === 'string' ? record.occurredAt : undefined,
            labels: Array.isArray(record.labels) ? [...record.labels] : [],
          } as SingleDraft;
        });

        setRecords(incoming);
        setRecordErrors(Array(incoming.length).fill(''));
        setRecordNoteErrors(Array(incoming.length).fill(''));
        setRecordCategoryErrors(Array(incoming.length).fill(''));
        showToast('Receipt items imported');
        scanPrefillRef.current = parsedParam;
        return;
      }

      if (!isReceiptImportResult(payload)) {
        return;
      }

      const { draftPatch } = payload;

      setRecords((prev) => {
        if (prev.length === 0) {
          return prev;
        }
        const [first, ...rest] = prev;
        const nextFirst: SingleDraft = {
          ...first,
          amount: draftPatch.amount ?? first.amount,
          payee: draftPatch.payee ?? first.payee,
          note: draftPatch.note ?? first.note,
          category: draftPatch.category ?? first.category,
          subcategoryId: draftPatch.subcategoryId ?? first.subcategoryId,
          occurredAt: typeof (draftPatch as any).occurredAt === 'string' ? (draftPatch as any).occurredAt : first.occurredAt,
        };

        return [nextFirst, ...rest];
      });

      setRecordErrors((prev) => prev.map((err, idx) => (idx === 0 ? '' : err)));
      setRecordNoteErrors((prev) => prev.map((err, idx) => (idx === 0 ? '' : err)));
      setRecordCategoryErrors((prev) => prev.map((err, idx) => (idx === 0 ? '' : err)));

      showToast('Receipt fields imported');
      scanPrefillRef.current = parsedParam;
    } catch (error) {
      console.error('Failed to import scan payload', error);
    }
  }, [params.parsed, showToast]);

  useEffect(() => {
    const unsubscribeCategory = subscribeToCategorySelection((payload) => {
      if (payload.target !== 'log-expenses-list') {
        return;
      }
      const index = typeof payload.recordIndex === 'number' ? payload.recordIndex : 0;
      if (payload.category) {
        transactionDraftState.setLastSelectedCategory(payload.category, transactionType);
      }
      transactionDraftState.setLastSelectedSubcategory(payload.subcategoryId ?? undefined, transactionType);
      setRecords((prev) =>
        prev.map((record, i) =>
          i === index
            ? {
                ...record,
                category: payload.category,
                subcategoryId: payload.subcategoryId ?? '',
              }
            : record
        )
      );
      setRecordCategoryErrors((prev) => prev.map((err, i) => (i === index ? '' : err)));
    });

    const unsubscribeDetails = subscribeToRecordDetailUpdates((payload) => {
      if (payload.target !== 'log-expenses-list') {
        return;
      }
      setRecords((prev) =>
        prev.map((record, i) => (i === payload.recordIndex ? payload.record : record))
      );
    });

    return () => {
      unsubscribeCategory();
      unsubscribeDetails();
    };
  }, [transactionType]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <AccountDropdown allowAll={false} useGlobalState={false} onSelect={(id) => setLocalSelectedAccount(id)} />
      ),
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            // if any record is edited, confirm before navigating back
            const anyEdited = records.some((r) => isRecordEdited(r));
            if (anyEdited) {
              Alert.alert(
                'Discard changes?',
                'You have unsaved changes. Do you want to discard and go back?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
                ],
                { cancelable: true }
              );
              return;
            }
            navigation.goBack();
          }}
          style={{ padding: 8 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={palette.icon} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleNext} style={{ padding: 8 }}>
          <ThemedText style={{ color: palette.tint, fontWeight: '600' }}>NEXT</ThemedText>
        </TouchableOpacity>
      ),
    });
  }, [navigation, palette.icon, palette.tint, handleNext, records, isRecordEdited]);

  useEffect(() => {
    // Block navigation if any record in the list is edited (unsaved)
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      const anyEdited = records.some((r) => isRecordEdited(r));
      if (!anyEdited) {
        // Allow navigation
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Do you want to discard and leave?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              // Remove listener and continue navigation
              navigation.dispatch(e.data.action);
            },
          },
        ],
        { cancelable: true }
      );
    });

    return unsubscribe;
  }, [navigation, records, isRecordEdited]);

  const totalRecords = records.length;
  const totalAmount = useMemo(() => {
    return records.reduce((sum, record) => {
      const numeric = Number(record.amount);
      if (isNaN(numeric)) {
        return sum;
      }
      return sum + numeric;
    }, 0);
  }, [records]);
  const formattedTotal = totalAmount.toFixed(2);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.keyboardWrapper}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.scrollContent, { backgroundColor: palette.background }]}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.summaryContainer, { borderColor: palette.border, backgroundColor: palette.card }]}> 
            <View style={styles.summaryHeader}> 
              <View style={styles.summaryAmounts}> 
                <ThemedText style={[styles.summaryLabel, { color: palette.icon }]}>Total Amount ({totalRecords})</ThemedText> 
                <ThemedText style={[styles.summaryTotal, { color: palette.text }]}>${formattedTotal}</ThemedText> 
              </View> 
              <TouchableOpacity
                style={[styles.iconButton, { borderColor: palette.border }]}
                onPress={() => router.push('/scan')}
                accessibilityRole="button"
                accessibilityLabel="Scan receipt"
              >
                <MaterialCommunityIcons name="camera-outline" size={20} color={palette.icon} />
              </TouchableOpacity>
            </View> 
          </View>

          {records.map((record, index) => {
            const categoryIcon = getCategoryIcon(record.subcategoryId || record.category, 'shape-outline');
            const categoryColor = getCategoryColor(record.subcategoryId || record.category, palette.tint);
            const categoryLabel = getFullCategoryLabel(record.category, record.subcategoryId) || 'Select category';

            return (
              <ThemedView
                key={index}
                style={[styles.recordCard, { backgroundColor: palette.card, borderColor: palette.border }]}
              >
                <View style={styles.noteRow}>
                  <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card, flex: 1 }]}>
                    <ThemedText style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}>Note*</ThemedText>
                    <TextInput
                      style={[styles.noteInput, styles.notchedInput, { color: palette.text }]}
                      placeholder="Add a note"
                      placeholderTextColor={palette.icon}
                      value={record.note}
                      onChangeText={(value) => handleNoteChange(index, value)}
                      onFocus={() => scrollToInput(200 + (index * 160))}
                    />
                  </View>
                  <View style={styles.stackedIconGroup}>
                    <TouchableOpacity onPress={() => openRecordDetails(index)} style={[styles.smallIconTouch, styles.noteMenuButton]}> 
                      <MaterialCommunityIcons name="dots-horizontal" size={18} color={palette.icon} />
                    </TouchableOpacity>
                    {records.length > 1 && (
                      <TouchableOpacity onPress={() => confirmAndRemoveRecord(index)} style={[styles.smallIconTouch, { marginTop: 6 }]}> 
                        <MaterialCommunityIcons name="trash-can" size={18} color={palette.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {recordNoteErrors[index] ? (
                  <ThemedText style={{ color: palette.error, fontSize: 12 }}>
                    {recordNoteErrors[index]}
                  </ThemedText>
                ) : null}

                <View style={styles.recordFooter}>
                  <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card, flex: 1, padding: 0 }]}> 
                    <ThemedText style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}>Category*</ThemedText>
                    <TouchableOpacity
                      style={[styles.categoryPill, { borderWidth: 0 }]}
                      onPress={() =>
                      router.push({
                        pathname: '/Category',
                        params: {
                          current: record.category,
                          currentSubcategory: record.subcategoryId,
                          returnTo: 'log-expenses-list',
                          recordIndex: index.toString(),
                          type: transactionType,
                          // do not auto open subcategories when switching to income
                          // autoOpenSubcategories: transactionType === 'income' ? '1' : undefined,
                        },
                      })
                      }
                    >
                    <View style={[styles.categoryIconBadge, { backgroundColor: `${categoryColor}22` }]}> 
                      <MaterialCommunityIcons name={categoryIcon} size={16} color={categoryColor} /> 
                    </View>
                    <View style={styles.categoryTextWrapper}>
                      <ThemedText style={[styles.categoryLabel, { color: palette.text }]} numberOfLines={1}>
                        {categoryLabel}
                      </ThemedText>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={18} color={palette.icon} />
                  </TouchableOpacity>
                </View>
                  <View style={{ minWidth: 110, maxWidth: 150 }}>
                    <View style={[styles.inputWrapper, styles.amountField, { borderColor: palette.border, backgroundColor: palette.card }]}>
                      <ThemedText style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}>Amount*</ThemedText>
                      <View style={styles.amountInputRow}>
                        <ThemedText style={[styles.currencyTiny, { color: palette.icon }]}>$</ThemedText>
                        <TextInput
                          style={[styles.amountCompactInput, styles.notchedInput, { color: palette.text }]}
                          keyboardType="numeric"
                          placeholder="0.00"
                          placeholderTextColor={palette.icon}
                          value={record.amount}
                          onChangeText={(value) => updateRecord(index, 'amount', value)}
                        />
                      </View>
                    </View>
                    {recordErrors[index] ? (
                      <ThemedText style={{ color: palette.error, fontSize: 12, marginTop: 4 }}>
                        {recordErrors[index]}
                      </ThemedText>
                    ) : null}
                  </View>
                  {/* delete action moved to top-right action group; no bottom delete button */}
                </View>
                {recordCategoryErrors[index] ? (
                  <ThemedText style={{ color: palette.error, fontSize: 12 }}>
                    {recordCategoryErrors[index]}
                  </ThemedText>
                ) : null}
              </ThemedView>
            );
          })}

          <TouchableOpacity
            onPress={addRecord}
            style={[styles.addListButton, { marginTop: 16 }]}
          >
            <MaterialCommunityIcons name="plus" size={18} color={palette.tint} />
            <ThemedText style={[styles.addListLabel, { color: palette.tint }]}>ADD RECORD</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}