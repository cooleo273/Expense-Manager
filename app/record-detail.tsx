import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getFullCategoryLabel } from '@/constants/categories';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { logExpensesStyles } from '@/styles/log-expenses.styles';
import { SingleDraft } from '@/types/transactions';
import { emitRecordDetailUpdate, subscribeToCategorySelection } from '@/utils/navigation-events';

const styles = logExpensesStyles;

export const options = {
  headerShown: true,
  headerTitle: 'Record Details',
};

type DraftErrors = {
  amount?: string;
  note?: string;
};

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
          amount: parsed.amount ?? '',
          category: parsed.category ?? 'housing',
          subcategoryId: parsed.subcategoryId,
          payee: parsed.payee ?? '',
          note: parsed.note ?? '',
          labels: Array.isArray(parsed.labels) ? parsed.labels : [],
        };
      } catch (error) {
        console.warn('Failed to hydrate record detail payload', error);
      }
    }
    return {
      amount: typeof params.amount === 'string' ? params.amount : '',
      category: typeof params.category === 'string' ? params.category : 'housing',
      subcategoryId: typeof params.subcategoryId === 'string' ? params.subcategoryId : undefined,
      payee: typeof params.payee === 'string' ? params.payee : '',
      note: typeof params.note === 'string' ? params.note : '',
      labels: [],
    };
  }, [params.amount, params.category, params.note, params.payload, params.payee, params.subcategoryId]);

  const [draft, setDraft] = useState<SingleDraft>(initialDraft);
  const [errors, setErrors] = useState<DraftErrors>({});

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

  const handleSave = useCallback(() => {
    if (!validate()) {
      showToast('Fix errors to continue');
      return;
    }

    emitRecordDetailUpdate({
      target: 'log-expenses-list',
      recordIndex,
      record: draft,
    });
    showToast('Details updated');
    navigation.goBack();
  }, [draft, navigation, recordIndex, showToast, validate]);

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
                  style={styles.categoryInput}
                  onPress={() =>
                    router.push({
                      pathname: '/categories',
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
                  <MaterialCommunityIcons name="chevron-down" size={18} color={palette.icon} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.card }]}>
                <ThemedText style={[styles.notchedLabel, { backgroundColor: palette.card, color: palette.icon }]}>Payee</ThemedText>
                <TextInput
                  style={[styles.notchedInput, { color: palette.text }]}
                  placeholder="Eg: Grocery Store"
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
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
