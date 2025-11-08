import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getFullCategoryLabel } from '@/constants/categories';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/contexts/ToastContext';
import { logExpensesStyles } from '@/styles/log-expenses.styles';
import { RecordType, SingleDraft } from '@/types/transactions';

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

  const [transactionType, setTransactionType] = useState<RecordType>(
    (params.type as RecordType) || 'expense'
  );
  const [records, setRecords] = useState<SingleDraft[]>([
    {
      amount: '',
      category: params.defaultCategory as string || '',
      subcategoryId: '',
      payee: '',
      note: '',
      labels: '',
    }
  ]);

  const updateRecord = useCallback((index: number, key: keyof SingleDraft, value: string) => {
    setRecords(prev => prev.map((record, i) =>
      i === index ? { ...record, [key]: value } : record
    ));
  }, []);

  const addRecord = useCallback(() => {
    setRecords(prev => [...prev, {
      amount: '',
      category: params.defaultCategory as string || '',
      subcategoryId: '',
      payee: '',
      note: '',
      labels: '',
    }]);
    showToast('Record added successfully');
  }, [params.defaultCategory, showToast]);

  const removeRecord = useCallback((index: number) => {
    if (records.length > 1) {
      setRecords(prev => prev.filter((_, i) => i !== index));
    }
  }, [records.length]);

  const handleNext = useCallback(() => {
    // Validate records
    const validRecords = records.filter(record => record.amount.trim());
    if (validRecords.length === 0) {
      Alert.alert('No records', 'Please add at least one record with an amount.');
      return;
    }

    // For now, just show an alert with the count
    Alert.alert('Next', `Proceeding with ${validRecords.length} records.`);
    // TODO: Navigate to confirmation or save
  }, [records]);

  useEffect(() => {
    const categoryParam = typeof params.category === 'string' ? params.category : undefined;
    const subcategoryParam = typeof params.subcategory === 'string' ? params.subcategory : undefined;
    const recordIndexParam = typeof params.recordIndex === 'string' ? parseInt(params.recordIndex) : undefined;

    if (!categoryParam && !subcategoryParam) {
      return;
    }

    if (recordIndexParam !== undefined && recordIndexParam >= 0 && recordIndexParam < records.length) {
      if (categoryParam) {
        updateRecord(recordIndexParam, 'category', categoryParam);
      }
      if (categoryParam && !subcategoryParam) {
        updateRecord(recordIndexParam, 'subcategoryId', '');
      } else if (subcategoryParam) {
        updateRecord(recordIndexParam, 'subcategoryId', subcategoryParam);
      }
    }
  }, [params.category, params.subcategory, params.recordIndex, records.length, updateRecord]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Add Expenses List',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={palette.icon} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleNext} style={{ padding: 8 }}>
          <ThemedText style={{ color: palette.tint, fontWeight: '600' }}>Next</ThemedText>
        </TouchableOpacity>
      ),
    });
  }, [navigation, palette.icon, palette.tint, handleNext]);

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
          {records.map((record, index) => (
            <ThemedView
              key={index}
              style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border, marginBottom: 16 }]}
            >
              <View style={styles.fieldGroup}>
                <ThemedText style={[styles.amountLabel, { color: palette.icon }]}>Record {index + 1}</ThemedText>
                <View style={styles.amountRow}>
                  <ThemedText style={[styles.currencySymbol, { color: palette.icon }]}>$</ThemedText>
                  <TextInput
                    style={[styles.amountInput, { color: palette.text }]}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={palette.icon}
                    value={record.amount}
                    onChangeText={(value) => updateRecord(index, 'amount', value)}
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
                        current: record.category,
                        currentSubcategory: record.subcategoryId,
                        returnTo: 'log-expenses-list',
                        recordIndex: index.toString(),
                      },
                    })
                  }
                >
                  <ThemedText style={[styles.categoryText, { color: palette.text }]}>
                    {getFullCategoryLabel(record.category, record.subcategoryId) || record.category}
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
                  value={record.payee}
                  onChangeText={(value) => updateRecord(index, 'payee', value)}
                />
              </View>

              <View style={styles.fieldGroup}>
                <ThemedText style={[styles.fieldLabel, { color: palette.icon }]}>Note</ThemedText>
                <TextInput
                  style={[styles.inputField, { borderColor: palette.border, color: palette.text }]}
                  placeholder="Add a note"
                  placeholderTextColor={palette.icon}
                  value={record.note}
                  onChangeText={(value) => updateRecord(index, 'note', value)}
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingTop: 8 }}>
                {records.length > 1 && (
                  <TouchableOpacity onPress={() => removeRecord(index)} style={{ padding: 4, marginRight: 8 }}>
                    <MaterialCommunityIcons name="delete" size={20} color={palette.error} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => {}} style={{ padding: 4 }}>
                  <MaterialCommunityIcons name="dots-vertical" size={20} color={palette.icon} />
                </TouchableOpacity>
              </View>
            </ThemedView>
          ))}

          <TouchableOpacity
            onPress={addRecord}
            style={[styles.addListButton, { backgroundColor: palette.card, marginTop: 16 }]}
          >
            <MaterialCommunityIcons name="plus" size={18} color={palette.tint} />
            <ThemedText style={[styles.addListLabel, { color: palette.tint }]}>Add Record</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}