import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { logExpensesStyles } from '@/styles/log-expenses.styles';
import { AccountDropdown } from '@/components/AccountDropdown';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransactionTypeFilter, TransactionTypeValue } from '@/components/TransactionTypeFilter';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const options = {
  headerShown: true,
  headerTitle: '',
};

type RecordType = Exclude<TransactionTypeValue, 'all'>;

type SingleDraft = {
  amount: string;
  category: string;
  payee: string;
  note: string;
  labels: string;
};

type BatchDraft = {
  id: string;
  note: string;
  category: string;
  amount: string;
};

type StoredRecord = {
  id: string;
  type: RecordType;
  amount: number;
  category: string;
  payee?: string;
  note?: string;
  labels?: string;
};

const categories = [
  'Uncategorised',
  'Food',
  'Transport',
  'Entertainment',
  'Bills',
  'Shopping',
  'Health',
  'Education',
  'Other',
];

const INITIAL_SINGLE_DRAFT: SingleDraft = {
  amount: '',
  category: 'Uncategorised',
  payee: '',
  note: '',
  labels: '',
};

const createBatchDraft = (defaultCategory: string = 'Uncategorised'): BatchDraft => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  note: '',
  category: defaultCategory,
  amount: '',
});

export default function LogExpensesScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const navigation = useNavigation();

  const [transactionType, setTransactionType] = useState<RecordType>('expense');
  const [singleDraft, setSingleDraft] = useState<SingleDraft>(INITIAL_SINGLE_DRAFT);
  const [batchDrafts, setBatchDrafts] = useState<BatchDraft[]>([createBatchDraft()]);
  const [storedRecords, setStoredRecords] = useState<StoredRecord[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [lastSelectedCategory, setLastSelectedCategory] = useState('Uncategorised');
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [currentEditingBatchId, setCurrentEditingBatchId] = useState<string | null>(null);

  const singleAmountRef = useRef<TextInput>(null);
  const firstBatchAmountRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isBatchMode) {
        firstBatchAmountRef.current?.focus();
      } else {
        singleAmountRef.current?.focus();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isBatchMode]);

  const batchTotal = useMemo(() => {
    return batchDrafts.reduce((sum, draft) => {
      const value = Number(draft.amount);
      if (!Number.isFinite(value)) {
        return sum;
      }
      return sum + value;
    }, 0);
  }, [batchDrafts]);

  const handleSingleChange = (key: keyof SingleDraft, value: string) => {
    setSingleDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleBatchChange = (id: string, key: keyof Omit<BatchDraft, 'id'>, value: string) => {
    setBatchDrafts((prev) =>
      prev.map((draft) => (draft.id === id ? { ...draft, [key]: value } : draft))
    );
  };

  const handleRemoveBatchDraft = (id: string) => {
    setBatchDrafts((prev) => {
      if (prev.length === 1) {
        return prev;
      }
      return prev.filter((draft) => draft.id !== id);
    });
  };

  const activateBatchMode = () => {
    if (isBatchMode) {
      return;
    }
    setIsBatchMode(true);
    setBatchDrafts([createBatchDraft(lastSelectedCategory), createBatchDraft(lastSelectedCategory)]);
  };

  const appendBatchDraft = () => {
    setBatchDrafts((prev) => [...prev, createBatchDraft(lastSelectedCategory)]);
  };

  const returnToSingleMode = () => {
    if (!isBatchMode) {
      return;
    }
    setIsBatchMode(false);
    resetDrafts();
  };

  const resetDrafts = () => {
    setSingleDraft({ ...INITIAL_SINGLE_DRAFT, category: lastSelectedCategory });
    setBatchDrafts([createBatchDraft(lastSelectedCategory)]);
  };

  const persistRecords = (records: StoredRecord[], stayOnScreen: boolean) => {
    setStoredRecords((prev) => [...records, ...prev]);
    resetDrafts();
    if (stayOnScreen) {
      Alert.alert('Saved', `${records.length} record${records.length > 1 ? 's' : ''} stored.`);
      if (isBatchMode) {
        setBatchDrafts([createBatchDraft(lastSelectedCategory), createBatchDraft(lastSelectedCategory)]);
      }
      return;
    }
    router.back();
  };

  const buildRecords = (): StoredRecord[] | null => {
    if (isBatchMode) {
      const validDrafts = batchDrafts.filter((draft) => draft.amount.trim().length > 0);
      if (validDrafts.length === 0) {
        Alert.alert('Amount missing', 'Add at least one amount to save.');
        return null;
      }

      const records: StoredRecord[] = [];
      for (const draft of validDrafts) {
        const numeric = Number(draft.amount);
        if (!Number.isFinite(numeric)) {
          Alert.alert('Invalid amount', 'Amounts must be numeric to save records.');
          return null;
        }
        records.push({
          id: `${Date.now()}-${draft.id}`,
          type: transactionType,
          amount: numeric,
          category: draft.category || 'Uncategorised',
          note: draft.note,
        });
      }
      return records;
    }

    if (!singleDraft.amount.trim()) {
      Alert.alert('Amount missing', 'Enter an amount before saving.');
      return null;
    }

    const numeric = Number(singleDraft.amount);
    if (!Number.isFinite(numeric)) {
      Alert.alert('Invalid amount', 'Amount must be numeric.');
      return null;
    }

    return [
      {
        id: Date.now().toString(),
        type: transactionType,
        amount: numeric,
        category: singleDraft.category || 'Uncategorised',
        payee: singleDraft.payee,
        note: singleDraft.note,
        labels: singleDraft.labels,
      },
    ];
  };

  const handleScanReceipt = () => {
    router.push('/scan');
  };

  const handleSave = (stayOnScreen: boolean) => {
    const records = buildRecords();
    if (!records) {
      return;
    }
    persistRecords(records, stayOnScreen);
  };

  const handleCategorySelect = (category: string) => {
    setLastSelectedCategory(category);
    if (currentEditingBatchId) {
      handleBatchChange(currentEditingBatchId, 'category', category);
      setCurrentEditingBatchId(null);
    } else {
      handleSingleChange('category', category);
    }
    setCategoryDropdownVisible(false);
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 8 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={palette.icon} />
          </TouchableOpacity>
          <AccountDropdown />
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={() => handleSave(false)} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
          <ThemedText style={{ color: palette.tint, fontWeight: '600' }}>Next</ThemedText>
        </TouchableOpacity>
      ),
    });
  }, [navigation, palette.icon, palette.tint, handleSave]);

  const totalSaved = storedRecords.length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardWrapper}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { backgroundColor: palette.background }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topControls}>
            <TransactionTypeFilter
              options={['expense', 'income']}
              value={transactionType}
              onChange={(value) => {
                if (value !== 'all') {
                  setTransactionType(value);
                }
              }}
            />
            {!isBatchMode ? (
              <TouchableOpacity
                onPress={activateBatchMode}
                style={[styles.addListButton, { borderColor: palette.border }]}
              >
                <MaterialCommunityIcons name="playlist-plus" size={18} color={palette.tint} />
                <ThemedText style={[styles.addListLabel, { color: palette.tint }]}>Add List</ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={returnToSingleMode}
                style={[styles.addListButton, { borderColor: palette.border }]}
              >
                <MaterialCommunityIcons name="numeric-1-circle" size={18} color={palette.icon} />
                <ThemedText style={[styles.addListLabel, { color: palette.icon }]}>Single entry</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {!isBatchMode ? (
            <ThemedView
              style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <View style={styles.fieldGroup}>
                <ThemedText style={[styles.amountLabel, { color: palette.icon }]}>Amount</ThemedText>
                <View style={styles.amountRow}>
                  <ThemedText style={[styles.currencySymbol, { color: palette.icon }]}>₹</ThemedText>
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

              <View style={styles.fieldGroup}>
                <ThemedText style={[styles.fieldLabel, { color: palette.icon }]}>Category</ThemedText>
                <TouchableOpacity
                  style={[styles.inputField, { borderColor: palette.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                  onPress={() => setCategoryDropdownVisible(true)}
                >
                  <ThemedText style={{ color: palette.text }}>{singleDraft.category || 'Select category'}</ThemedText>
                  <MaterialCommunityIcons name="chevron-down" size={18} color={palette.icon} />
                </TouchableOpacity>
              </View>

              <View style={styles.fieldGroup}>
                <ThemedText style={[styles.fieldLabel, { color: palette.icon }]}>Payee</ThemedText>
                <TextInput
                  style={[styles.inputField, { borderColor: palette.border, color: palette.text }]}
                  placeholder="Eg: Boardwalk Housing"
                  placeholderTextColor={palette.icon}
                  value={singleDraft.payee}
                  onChangeText={(value) => handleSingleChange('payee', value)}
                />
              </View>

              <View style={styles.fieldGroup}>
                <ThemedText style={[styles.fieldLabel, { color: palette.icon }]}>Note</ThemedText>
                <TextInput
                  style={[styles.inputField, { borderColor: palette.border, color: palette.text }]}
                  placeholder="Add a note"
                  placeholderTextColor={palette.icon}
                  value={singleDraft.note}
                  onChangeText={(value) => handleSingleChange('note', value)}
                />
              </View>

              <View style={styles.fieldGroup}>
                <ThemedText style={[styles.fieldLabel, { color: palette.icon }]}>Labels</ThemedText>
                <TextInput
                  style={[styles.inputField, { borderColor: palette.border, color: palette.text }]}
                  placeholder="Eg: groceries, weekend"
                  placeholderTextColor={palette.icon}
                  value={singleDraft.labels}
                  onChangeText={(value) => handleSingleChange('labels', value)}
                />
              </View>
            </ThemedView>
          ) : (
            <ThemedView
              style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <View style={styles.batchSummary}>
                <View>
                  <ThemedText style={[styles.fieldLabel, { color: palette.icon }]}>Total Amount</ThemedText>
                  <ThemedText style={[styles.batchTotal, { color: palette.text }]}>
                    ₹{batchTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={handleScanReceipt}
                  style={[styles.cameraButton, { borderColor: palette.border, backgroundColor: palette.tint }]}
                >
                  <MaterialCommunityIcons name="camera-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>

              <View style={styles.batchList}>
                {batchDrafts.map((draft, index) => {
                  const amountRef = index === 0 ? firstBatchAmountRef : undefined;
                  return (
                    <View
                      key={draft.id}
                      style={[styles.batchCard, { borderColor: palette.border, backgroundColor: palette.surface }]}
                    >
                      <View style={styles.batchHeader}>
                        <ThemedText style={[styles.batchTitle, { color: palette.text }]}>
                          Record {index + 1}
                        </ThemedText>
                        <TouchableOpacity
                          onPress={() => handleRemoveBatchDraft(draft.id)}
                          style={styles.removeButton}
                        >
                          <MaterialCommunityIcons name="trash-can-outline" size={18} color={palette.error} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.fieldGroup}>
                        <ThemedText style={[styles.fieldLabel, { color: palette.icon }]}>Note</ThemedText>
                        <TextInput
                          style={[styles.inputField, { borderColor: palette.border, color: palette.text }]}
                          placeholder="Eg: Banana 2Kg"
                          placeholderTextColor={palette.icon}
                          value={draft.note}
                          onChangeText={(value) => handleBatchChange(draft.id, 'note', value)}
                        />
                      </View>

                      <View style={styles.batchInputs}>
                        <View style={[styles.fieldGroup, styles.batchField]}>
                          <ThemedText style={[styles.fieldLabel, { color: palette.icon }]}>Category</ThemedText>
                          <TouchableOpacity
                            style={[styles.inputField, { borderColor: palette.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                            onPress={() => { setCurrentEditingBatchId(draft.id); setCategoryDropdownVisible(true); }}
                          >
                            <ThemedText style={{ color: palette.text }}>{draft.category || 'Uncategorised'}</ThemedText>
                            <MaterialCommunityIcons name="chevron-down" size={16} color={palette.icon} />
                          </TouchableOpacity>
                        </View>
                        <View style={[styles.fieldGroup, styles.batchField]}>
                          <ThemedText style={[styles.fieldLabel, { color: palette.icon }]}>Amount</ThemedText>
                          <TextInput
                            ref={amountRef as React.RefObject<TextInput>}
                            style={[styles.batchAmountInput, { borderColor: palette.border, color: palette.text }]}
                            keyboardType="numeric"
                            placeholder="0.00"
                            placeholderTextColor={palette.icon}
                            value={draft.amount}
                            onChangeText={(value) => handleBatchChange(draft.id, 'amount', value)}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={appendBatchDraft}
                style={[styles.addRecordButton, { borderColor: palette.border, backgroundColor: palette.surface }]}
              >
                <MaterialCommunityIcons name="plus-circle" size={18} color={palette.tint} />
                <ThemedText style={[styles.addRecordText, { color: palette.tint }]}>Add Record +</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}

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
      <Modal transparent visible={categoryDropdownVisible} animationType="fade" onRequestClose={() => { setCategoryDropdownVisible(false); setCurrentEditingBatchId(null); }}>
        <Pressable style={styles.menuOverlay} onPress={() => { setCategoryDropdownVisible(false); setCurrentEditingBatchId(null); }}>
          <View style={[styles.menuContainer, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleCategorySelect(item)}
                >
                  <ThemedText style={[styles.menuLabel, { color: palette.text }]}>{item}</ThemedText>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = logExpensesStyles;