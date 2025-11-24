import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountDropdown } from '@/components/AccountDropdown';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransactionTypeFilter, TransactionTypeValue } from '@/components/TransactionTypeFilter';
import { getCategoryDefinition, getFullCategoryLabel } from '@/constants/categories';
import { mockAccounts } from '@/constants/mock-data';
import { Colors, Spacing } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { transactionDraftState } from '@/state/transactionDraftState';
import { logExpensesStyles } from '@/styles/log-expenses.styles';
import { RecordType, SingleDraft, StoredRecord } from '@/types/transactions';
import { subscribeToCategorySelection } from '@/utils/navigation-events';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { StorageService } from '../services/storage';

export const options = {
  headerShown: true,
  headerTitle: '',
};

const styles = logExpensesStyles;

export default function LogExpensesScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { filters, setSelectedAccount } = useFilterContext();

  const [transactionType, setTransactionType] = useState<RecordType>(
    transactionDraftState.getTransactionType()
  );
  const [singleDraft, setSingleDraft] = useState<SingleDraft>(() =>
    transactionDraftState.getSingleDraft()
  );
  const [storedRecords, setStoredRecords] = useState<StoredRecord[]>([]);
  const [lastSelectedCategory, setLastSelectedCategoryState] = useState(
    transactionDraftState.getLastSelectedCategory()
  );
  const [showMenu, setShowMenu] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [payeeError, setPayeeError] = useState('');
  const [recordDate, setRecordDate] = useState(() => new Date());
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const [currentLabelInput, setCurrentLabelInput] = useState('');

  const singleAmountRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToInput = useCallback((yOffset: number) => {
    scrollViewRef.current?.scrollTo({ y: yOffset, animated: true });
  }, [transactionType]);

  const scrollToEnd = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  const accountOptions = useMemo(() => mockAccounts.filter(acc => acc.id !== 'all'), []);
  const fallbackAccountId = accountOptions[0]?.id ?? null;

  const [localSelectedAccount, setLocalSelectedAccount] = useState<string | null>(fallbackAccountId);
  useEffect(() => {
    // Do not force a fallback account here — allow the dropdown to show 'All'
    // when opening Log Expenses. Users expect 'All' as default when adding a record.
    // if (filters.selectedAccount === 'all' && fallbackAccountId) {
    //   setSelectedAccount(fallbackAccountId);
    // }
  }, [filters.selectedAccount, fallbackAccountId, setSelectedAccount]);

  const selectedAccountId = localSelectedAccount ?? (filters.selectedAccount === 'all' ? fallbackAccountId : filters.selectedAccount);

  const selectedAccount = useMemo(() => {
    return accountOptions.find(acc => acc.id === selectedAccountId);
  }, [accountOptions, selectedAccountId]);

  const selectedAccountName = selectedAccount?.name ?? 'Select account';

  const formattedDate = useMemo(
    () => recordDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    [recordDate]
  );
  const formattedTime = useMemo(
    () => recordDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    [recordDate]
  );

  const handleDateTimeChange = useCallback(
    (_event: DateTimePickerEvent, date?: Date) => {
      if (!date || !pickerMode) {
        if (Platform.OS !== 'ios') {
          setPickerMode(null);
        }
        return;
      }
      setRecordDate((prev) => {
        const next = new Date(prev);
        if (pickerMode === 'date') {
          next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        } else {
          next.setHours(date.getHours(), date.getMinutes(), 0, 0);
        }
        return next;
      });
      if (Platform.OS !== 'ios') {
        setPickerMode(null);
      }
    },
    [pickerMode]
  );

  const addLabel = useCallback(() => {
    const trimmed = currentLabelInput.trim();
    if (!trimmed) {
      return;
    }

    setSingleDraft((prev) => {
      const labels = Array.isArray(prev.labels) ? prev.labels : [];
      if (labels.includes(trimmed)) {
        return prev;
      }
      const next = {
        ...prev,
        labels: [...labels, trimmed],
      };
      transactionDraftState.setSingleDraft(next);
      return next;
    });
    setCurrentLabelInput('');
  }, [currentLabelInput]);

  const removeLabel = useCallback((labelToRemove: string) => {
    setSingleDraft((prev) => {
      const next = {
        ...prev,
        labels: (prev.labels ?? []).filter((label) => label !== labelToRemove),
      };
      transactionDraftState.setSingleDraft(next);
      return next;
    });
  }, []);

  const updateLastSelectedCategory = useCallback(
    (category: string | undefined, overrideType?: RecordType) => {
      if (!category) {
        return;
      }
      const categoryType = getCategoryDefinition(category)?.type ?? overrideType ?? transactionType;
      if (categoryType === 'expense') {
        setLastSelectedCategoryState(category);
      }
      transactionDraftState.setLastSelectedCategory(category, categoryType);
    },
    [transactionType]
  );

  const handleSingleChange = useCallback(
    (key: keyof SingleDraft, value?: string) => {
      setSingleDraft((prev) => {
        const next: SingleDraft = { ...prev };

        if (key === 'labels') {
          return prev;
        }

        if (key === 'subcategoryId') {
          if (value) {
            next.subcategoryId = value;
            transactionDraftState.setLastSelectedSubcategory(value, transactionType);
          } else {
            delete next.subcategoryId;
            transactionDraftState.setLastSelectedSubcategory(undefined, transactionType);
          }
        } else if (key === 'category') {
          const nextCategory = value ?? '';
          (next as any)[key] = nextCategory;
          if (!nextCategory) {
            delete next.subcategoryId;
            transactionDraftState.setLastSelectedSubcategory(undefined, transactionType);
          } else {
            const derivedType = getCategoryDefinition(nextCategory)?.type;
            updateLastSelectedCategory(nextCategory, derivedType);
          }
          setCategoryError('');
        } else {
          (next as any)[key] = value ?? '';
          if (key === 'amount') {
            setAmountError('');
          }
          if (key === 'payee') {
            setPayeeError('');
          }
        }

        transactionDraftState.setSingleDraft(next);
        return next;
      });
    },
    [transactionType, updateLastSelectedCategory]
  );

  useEffect(() => {
    const unsubscribe = subscribeToCategorySelection((payload) => {
      if (payload.target !== 'log-expenses') {
        return;
      }
      if (payload.category) {
        handleSingleChange('category', payload.category);
      }
      if (payload.subcategoryId) {
        handleSingleChange('subcategoryId', payload.subcategoryId);
      } else {
        handleSingleChange('subcategoryId', undefined);
      }
    });
    return unsubscribe;
  }, [handleSingleChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      singleAmountRef.current?.focus();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const resetDrafts = useCallback(() => {
    const next = transactionDraftState.resetSingleDraft(lastSelectedCategory);
    setSingleDraft(next);
  }, [lastSelectedCategory]);

  const persistRecords = useCallback(async (records: StoredRecord[], stayOnScreen: boolean) => {
    try {
      await StorageService.addBatchTransactions(
        records.map((record) => ({
          id: record.id,
          title: record.note || 'Transaction',
          account: accountOptions.find((acc) => acc.id === record.accountId)?.name || selectedAccountName,
          accountId: record.accountId,
          note: record.note || '',
          amount: record.type === 'expense' ? -Math.abs(record.amount) : record.amount,
          date: record.occurredAt,
          type: record.type,
          icon: 'cash',
          categoryId: record.category,
          subcategoryId: record.subcategoryId,
          labels: record.labels,
          userId: 'default-user',
        }))
      );

      setStoredRecords((prev) => [...records, ...prev]);
      // Persist usage counts for categories (and subcategories) so "MOST FREQUENT"
      // shows the selected items after saving a record.
      try {
        await Promise.all(
          records.map((record) => StorageService.incrementCategoryUsage(record.subcategoryId ?? record.category))
        );
      } catch (err) {
        // not fatal; just log
        console.error('Failed to increment category usage:', err);
      }
      resetDrafts();

      showToast('Record saved successfully');

      if (stayOnScreen) {
        Alert.alert('Saved', `${records.length} record${records.length > 1 ? 's' : ''} stored.`);
        return;
      }

      // Ensure records page shows All Accounts by default after adding a record.
      setSelectedAccount('all');
      router.push('/(tabs)/records');
    } catch (error) {
      console.error('Failed to save transactions:', error);
      Alert.alert('Error', 'Failed to save transactions. Please try again.');
    }
  }, [accountOptions, resetDrafts, router, selectedAccountName, showToast]);

  const buildRecords = useCallback((): StoredRecord[] | null => {
    let hasError = false;

    // Amount validation
    const amountStr = singleDraft.amount.trim();
    if (!amountStr) {
      setAmountError('Amount is required');
      hasError = true;
    } else {
      const numeric = Number(amountStr);
      if (isNaN(numeric) || !isFinite(numeric)) {
        setAmountError('Amount must be a valid number');
        hasError = true;
      } else if (numeric <= 0) {
        setAmountError('Amount must be greater than 0');
        hasError = true;
      } else {
        setAmountError('');
      }
    }

    // Category validation
    if (!singleDraft.category || singleDraft.category.trim() === '') {
      setCategoryError('Category is required');
      hasError = true;
    } else {
      setCategoryError('');
    }

    // Payee validation
    if (!singleDraft.payee || singleDraft.payee.trim() === '') {
      setPayeeError('Payee is required');
      hasError = true;
    } else {
      setPayeeError('');
    }

    if (hasError) {
      return null;
    }

    if (!selectedAccountId) {
      Alert.alert('Account required', 'Please select an account before saving.');
      return null;
    }

    return [
      {
        id: Date.now().toString(),
        type: transactionType,
        amount: Number(amountStr),
        category: singleDraft.category,
        subcategoryId: singleDraft.subcategoryId,
        payee: singleDraft.payee.trim(),
        note: singleDraft.note,
        labels: singleDraft.labels,
        accountId: selectedAccountId,
        occurredAt: recordDate.toISOString(),
      },
    ];
  }, [recordDate, selectedAccountId, singleDraft, transactionType]);

  const handleSave = useCallback(
    (stayOnScreen: boolean) => {
      const records = buildRecords();
      if (!records) {
        return;
      }
      persistRecords(records, stayOnScreen);
    },
    [buildRecords, persistRecords]
  );

  const handleTransactionTypeChange = useCallback(
    (value: TransactionTypeValue) => {
      if (value === 'all') {
        return;
      }
      setTransactionType(value);
      transactionDraftState.setTransactionType(value);
      if (value === 'income') {
        // Pre-populate the Category dropdown as 'Income' when switching to income
        handleSingleChange('category', 'income');
        // Remove any subcategory — Income must not display subcategories when switched
        handleSingleChange('subcategoryId', undefined);
        // store that Income was chosen so future openings remember it under income type
        transactionDraftState.setLastSelectedCategory('income', 'income');
      } else if (value === 'expense') {
        // Restore last selected expense category when switching back to expense
        const lastExpense = transactionDraftState.getLastSelectedCategory('expense');
        handleSingleChange('category', lastExpense);
      }
    },
    [handleSingleChange]
  );

  useEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 8 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={palette.icon} />
          </TouchableOpacity>
          <AccountDropdown allowAll={false} useGlobalState={false} onSelect={(id) => setLocalSelectedAccount(id)} />
        </View>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => handleSave(false)} style={{ padding: 8, marginRight: 8 }}>
            <MaterialCommunityIcons name="check" size={24} color={palette.tint} />
          </TouchableOpacity>
          <Menu
            visible={showMenu}
            onDismiss={() => setShowMenu(false)}
            anchor={
              <TouchableOpacity onPress={() => setShowMenu(true)} style={{ padding: 8 }}>
                <MaterialCommunityIcons name="dots-vertical" size={24} color={palette.icon} />
              </TouchableOpacity>
            }
            contentStyle={{ backgroundColor: palette.card, borderColor: palette.border, borderWidth: 1 }}
          >
            <Menu.Item
              onPress={() => {
                handleSave(true);
                setShowMenu(false);
              }}
              title="Save and add new record"
              titleStyle={{ color: palette.text }}
            />
            <Menu.Item
              onPress={() => {
                Alert.alert('Template Saved', 'Record saved as template for future use.');
                setShowMenu(false);
              }}
              title="Save template"
              titleStyle={{ color: palette.text }}
            />
          </Menu>
        </View>
      ),
    });
  }, [handleSave, navigation, palette.border, palette.card, palette.icon, palette.text, palette.tint, showMenu]);

  // Dont force global selection when adding a record; keep log-expenses local so
  // it won't affect Records filters. After saving we will set the record page's
  // global selection to 'all' so the account dropdown there shows All Accounts.

  const totalSaved = storedRecords.length;

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
          <View style={styles.topControls}>
            <TransactionTypeFilter
              options={['expense', 'income']}
              value={transactionType}
              onChange={handleTransactionTypeChange}
            />
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/log-expenses-list',
                  params: {
                    type: transactionType,
                    defaultCategory: transactionType === 'income' ? 'income' : lastSelectedCategory,
                  },
                })
              }
              style={[styles.addListButton, { borderColor: palette.border, backgroundColor: palette.card }]}
            >
              <MaterialCommunityIcons name="playlist-plus" size={18} color={palette.tint} />
              <ThemedText style={[styles.addListLabel, { color: palette.tint, fontSize: 14 }]}>Add List</ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedView
            style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <View style={styles.fieldGroup}>
              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card }]}>
                <ThemedText style={[styles.notchedLabel, { color: palette.icon, backgroundColor: palette.card }]}>
                  Amount*
                </ThemedText>
                <View style={styles.amountRow}>
                  <ThemedText style={[styles.currencySymbol, { color: palette.icon }]}>$</ThemedText>
                  <TextInput
                    ref={singleAmountRef}
                    style={[styles.amountInput, { color: palette.text }]}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={palette.icon}
                    value={singleDraft.amount}
                    onChangeText={(value) => handleSingleChange('amount', value)}
                  />
                </View>
              </View>
            </View>
              {amountError ? (
                <ThemedText style={{ color: palette.error, fontSize: 12, marginTop: 4 }}>
                  {amountError}
                </ThemedText>
              ) : null}

            <View style={styles.fieldGroup}>
              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card }]}>
                <ThemedText style={[styles.notchedLabel, { color: palette.icon, backgroundColor: palette.card }]}>
                  Category*
                </ThemedText>
                <TouchableOpacity
                  style={styles.categoryInput}
                  onPress={() =>
                    router.push({
                      pathname: '/Category',
                      params: {
                        current: singleDraft.category,
                        currentSubcategory: singleDraft.subcategoryId,
                        returnTo: 'log-expenses',
                        type: transactionType,
                        // do not auto open subcategories when switching to income
                        // autoOpenSubcategories: transactionType === 'income' ? '1' : undefined,
                      },
                    })
                  }
                >
                  <ThemedText style={[styles.categoryText, { color: palette.text }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {getFullCategoryLabel(singleDraft.category, singleDraft.subcategoryId) || singleDraft.category}
                  </ThemedText>
                  <MaterialCommunityIcons name="chevron-down" size={18} color={palette.icon} />
                </TouchableOpacity>
              </View>
              {categoryError ? (
                <ThemedText style={{ color: palette.error, fontSize: 12, marginTop: 4 }}>
                  {categoryError}
                </ThemedText>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card }]}>
                <ThemedText style={[styles.notchedLabel, { color: palette.icon, backgroundColor: palette.card }]}>
                  {transactionType === 'income' ? 'Payer*' : 'Payee*'}
                </ThemedText>
                <TextInput
                  style={[styles.notchedInput, { color: palette.text }]}
                  placeholder={transactionType === 'income' ? 'Eg: Company X' : 'Eg: Boardwalk Housing'}
                  placeholderTextColor={palette.icon}
                  value={singleDraft.payee}
                  onChangeText={(value) => handleSingleChange('payee', value)}
                />
              </View>
              {payeeError ? (
                <ThemedText style={{ color: palette.error, fontSize: 12, marginTop: 4 }}>
                  {payeeError}
                </ThemedText>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card }]}>
                <ThemedText style={[styles.notchedLabel, { color: palette.icon, backgroundColor: palette.card }]}>
                  Note
                </ThemedText>
                <TextInput
                  style={[styles.notchedInput, { color: palette.text }]}
                  placeholder="Add a note"
                  placeholderTextColor={palette.icon}
                  value={singleDraft.note}
                  onChangeText={(value) => handleSingleChange('note', value)}
                  onFocus={() => scrollToInput(280)}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card }]}>
                <ThemedText style={[styles.notchedLabel, { color: palette.icon, backgroundColor: palette.card }]}>
                  Labels
                </ThemedText>
                {/* keep input inside the inputWrapper */}
                <View style={{ marginTop: singleDraft.labels.length > 0 ? Spacing.sm : 0 }}>
                  <TextInput
                    style={[styles.notchedInput, { color: palette.text }]}
                    placeholder="Add a label"
                    placeholderTextColor={palette.icon}
                    value={currentLabelInput}
                    onChangeText={setCurrentLabelInput}
                    onSubmitEditing={addLabel}
                    onFocus={() => scrollToInput(350)}
                  />
                  <TouchableOpacity onPress={addLabel} style={styles.addLabelButton}>
                    <MaterialCommunityIcons name="plus" size={20} color={palette.tint} />
                  </TouchableOpacity>
                </View>
                </View>
              </View>

            {/* Display labels outside the input box and below it */}
            {singleDraft.labels.length > 0 && (
              <View style={{ marginTop: Spacing.sm }}>
                <View style={styles.labelsContainer}>
                  {singleDraft.labels.map((label) => (
                    <View key={label} style={[styles.labelChip, { backgroundColor: palette.highlight, borderColor: palette.border }]}>
                      <ThemedText style={[styles.labelText, { color: palette.text }]}>{label}</ThemedText>
                      <TouchableOpacity onPress={() => removeLabel(label)} style={styles.removeLabelButton}>
                        <MaterialCommunityIcons name="close" size={16} color={palette.icon} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.fieldGroup}>
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
                    style={[styles.dateTimeButton, styles.dateTimeButtonInput]}
                    onPress={() => {
                      setPickerMode('date');
                      scrollToEnd();
                    }}
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
                    style={[styles.dateTimeButton, styles.dateTimeButtonInput]}
                    onPress={() => {
                      setPickerMode('time');
                      scrollToEnd();
                    }}
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

          {totalSaved > 0 ? (
            <ThemedView
              style={[styles.savedSummary, { backgroundColor: palette.highlight, borderColor: palette.border }]}
            >
              <ThemedText style={{ color: palette.text, fontWeight: '600' }}>
                {totalSaved} record{totalSaved > 1 ? 's' : ''} saved this session
              </ThemedText>
              <ThemedText style={{ color: palette.icon }}>
                Saved items sync once you reconnect.
              </ThemedText>
            </ThemedView>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

