import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { TransactionTypeFilter, TransactionTypeValue } from '@/components/TransactionTypeFilter';
import { getFullCategoryLabel } from '@/constants/categories';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { transactionDraftState } from '@/state/transactionDraftState';
import { logExpensesStyles } from '@/styles/log-expenses.styles';
import { RecordType, SingleDraft, StoredRecord } from '@/types/transactions';
import { StorageService } from '../services/storage';
import { useToast } from '@/contexts/ToastContext';

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
  const params = useLocalSearchParams();
  const { showToast } = useToast();

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

  const singleAmountRef = useRef<TextInput>(null);

  const updateLastSelectedCategory = useCallback((category: string) => {
    setLastSelectedCategoryState(category);
    transactionDraftState.setLastSelectedCategory(category);
  }, []);

  const handleSingleChange = useCallback(
    (key: keyof SingleDraft, value?: string) => {
      setSingleDraft((prev) => {
        const next: SingleDraft = { ...prev };

        if (key === 'subcategoryId') {
          if (value) {
            next.subcategoryId = value;
          } else {
            delete next.subcategoryId;
          }
        } else {
          (next as any)[key] = value ?? '';
          if (key === 'category') {
            updateLastSelectedCategory(value ?? next.category);
            if (!value) {
              delete next.subcategoryId;
            }
          }
        }

        transactionDraftState.setSingleDraft(next);
        return next;
      });
    },
    [updateLastSelectedCategory]
  );

  useEffect(() => {
    const categoryParam = typeof params.category === 'string' ? params.category : undefined;
    const subcategoryParam = typeof params.subcategory === 'string' ? params.subcategory : undefined;

    if (!categoryParam && !subcategoryParam) {
      return;
    }

    if (categoryParam) {
      handleSingleChange('category', categoryParam);
      updateLastSelectedCategory(categoryParam);
    }

    if (categoryParam && !subcategoryParam) {
      handleSingleChange('subcategoryId', undefined);
    } else if (subcategoryParam) {
      handleSingleChange('subcategoryId', subcategoryParam);
    }
  }, [handleSingleChange, params.category, params.subcategory, updateLastSelectedCategory]);

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
          account: 'Default Account',
          note: record.note || '',
          amount: record.type === 'expense' ? -Math.abs(record.amount) : record.amount,
          date: new Date().toISOString(),
          type: record.type,
          icon: 'cash',
          categoryId: record.category,
          subcategoryId: record.subcategoryId,
          userId: 'default-user',
        }))
      );

      setStoredRecords((prev) => [...records, ...prev]);
      resetDrafts();

      showToast('Record saved successfully');

      if (stayOnScreen) {
        Alert.alert('Saved', `${records.length} record${records.length > 1 ? 's' : ''} stored.`);
        return;
      }

      router.push('/(tabs)');
    } catch (error) {
      console.error('Failed to save transactions:', error);
      Alert.alert('Error', 'Failed to save transactions. Please try again.');
    }
  }, [resetDrafts, router, showToast]);

  const buildRecords = useCallback((): StoredRecord[] | null => {
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
        subcategoryId: singleDraft.subcategoryId,
        payee: singleDraft.payee,
        note: singleDraft.note,
        labels: singleDraft.labels,
      },
    ];
  }, [singleDraft, transactionType]);

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
    },
    []
  );

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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => handleSave(false)} style={{ padding: 8, marginRight: 8 }}>
            <MaterialCommunityIcons name="check" size={24} color={palette.tint} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowMenu(true)} style={{ padding: 8 }}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color={palette.icon} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [handleSave, navigation, palette.icon, palette.tint]);

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
              onChange={handleTransactionTypeChange}
            />
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/log-expenses-list',
                  params: {
                    type: transactionType,
                    defaultCategory: lastSelectedCategory,
                  },
                })
              }
              style={[styles.addListButton, { borderColor: palette.border, backgroundColor: palette.card }]}
            >
              <MaterialCommunityIcons name="playlist-plus" size={18} color={palette.tint} />
              <ThemedText style={[styles.addListLabel, { color: palette.tint }]}>Add List</ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedView
            style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.amountLabel, { color: palette.icon }]}>Amount</ThemedText>
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

            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.fieldLabel, { color: palette.icon }]}>Category</ThemedText>
              <TouchableOpacity
                style={[
                  styles.inputField,
                  {
                    borderColor: palette.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/categories',
                    params: {
                      current: singleDraft.category,
                      currentSubcategory: singleDraft.subcategoryId,
                      returnTo: 'log-expenses',
                    },
                  })
                }
              >
                <ThemedText style={[styles.categoryText, { color: palette.text }]}
                >
                  {getFullCategoryLabel(singleDraft.category, singleDraft.subcategoryId) || singleDraft.category}
                </ThemedText>
                <MaterialCommunityIcons name="chevron-down" size={18} color={palette.icon} />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.fieldLabel, { color: palette.icon }]}>
                {transactionType === 'income' ? 'Payer' : 'Payee'}
              </ThemedText>
              <TextInput
                style={[styles.inputField, { borderColor: palette.border, color: palette.text }]}
                placeholder={transactionType === 'income' ? 'Eg: Company X' : 'Eg: Boardwalk Housing'}
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

      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View
            style={{
              position: 'absolute',
              top: 100,
              right: 20,
              backgroundColor: palette.card,
              borderRadius: 8,
              padding: 8,
              minWidth: 150,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                handleSave(true);
                setShowMenu(false);
              }}
              style={{ padding: 12 }}
            >
              <ThemedText style={{ color: palette.text }}>Save and add new record</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Template Saved', 'Record saved as template for future use.');
                setShowMenu(false);
              }}
              style={{ padding: 12 }}
            >
              <ThemedText style={{ color: palette.text }}>Save template</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}