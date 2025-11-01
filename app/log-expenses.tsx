import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, TextInput, TouchableOpacity, View } from 'react-native';

import { logExpensesStyles } from '@/app/styles/log-expenses.styles';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type EntryType = 'Expense' | 'Income' | 'Transfer';

type Entry = {
  id: string;
  type: EntryType;
  date: string;
  amount: string;
  category: string;
  paymentMode: string;
  notes: string;
  tags: string;
};

export default function LogExpensesScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [tab, setTab] = useState<EntryType>('Expense');
  const [form, setForm] = useState({ date: '', amount: '', category: '', paymentMode: '', notes: '', tags: '' });
  const [entries, setEntries] = useState<Entry[]>([]);

  const filteredEntries = useMemo(
    () => entries.filter((entry) => entry.type === tab),
    [entries, tab]
  );

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.amount.trim() || Number.isNaN(Number(form.amount))) {
      Alert.alert('Amount missing', 'Please enter a valid amount to save.');
      return;
    }

    const payload: Entry = {
      id: Date.now().toString(),
      type: tab,
      date: form.date || new Date().toLocaleDateString(),
      amount: form.amount,
      category: form.category,
      paymentMode: form.paymentMode,
      notes: form.notes,
      tags: form.tags,
    };

    setEntries((prev) => [payload, ...prev]);
    setForm({ date: '', amount: '', category: '', paymentMode: '', notes: '', tags: '' });
    Alert.alert('Saved offline', `${tab} of ₹${payload.amount} stored locally. We'll sync when online.`);
  };

  return (
    <ThemedView style={[styles.safeArea, { backgroundColor: palette.background }]}> 
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <ThemedText type="title">Add a transaction</ThemedText>
              <ThemedText style={{ color: palette.icon }}>
                Log expenses, incomes, or transfers manually.
              </ThemedText>
            </View>

            <View style={[styles.tabs, { backgroundColor: `${palette.tint}0D` }]}>
              {(['Expense', 'Income', 'Transfer'] as EntryType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTab(t)}
                  style={[styles.tab, tab === t && { backgroundColor: palette.tint }]}
                >
                  <ThemedText style={[styles.tabText, tab === t && { color: '#FFFFFF' }]}>{t}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.form}>
              <TextInput
                placeholder="Date"
                value={form.date}
                onChangeText={(value) => updateField('date', value)}
                style={[styles.input, { borderColor: palette.border, color: palette.text }]}
                placeholderTextColor={palette.icon}
              />
              <TextInput
                placeholder="Amount"
                value={form.amount}
                keyboardType="numeric"
                onChangeText={(value) => updateField('amount', value)}
                style={[styles.input, { borderColor: palette.border, color: palette.text }]}
                placeholderTextColor={palette.icon}
              />
              <TextInput
                placeholder="Category"
                value={form.category}
                onChangeText={(value) => updateField('category', value)}
                style={[styles.input, { borderColor: palette.border, color: palette.text }]}
                placeholderTextColor={palette.icon}
              />
              <TextInput
                placeholder="Payment mode"
                value={form.paymentMode}
                onChangeText={(value) => updateField('paymentMode', value)}
                style={[styles.input, { borderColor: palette.border, color: palette.text }]}
                placeholderTextColor={palette.icon}
              />
              <TextInput
                placeholder="Notes"
                value={form.notes}
                onChangeText={(value) => updateField('notes', value)}
                style={[styles.input, { borderColor: palette.border, color: palette.text }]}
                placeholderTextColor={palette.icon}
              />
              <TextInput
                placeholder="Tags (comma separated)"
                value={form.tags}
                onChangeText={(value) => updateField('tags', value)}
                style={[styles.input, { borderColor: palette.border, color: palette.text }]}
                placeholderTextColor={palette.icon}
              />
              <TouchableOpacity style={[styles.scanButton, { backgroundColor: palette.success }]}
                onPress={() => router.push('/scan')}>
                <ThemedText style={styles.buttonText}>Scan receipt instead</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: palette.tint }]} onPress={handleSave}>
                <ThemedText style={styles.buttonText}>Save entry</ThemedText>
              </TouchableOpacity>
              <ThemedText style={{ color: palette.icon }}>Stored on device · Auto-sync when online</ThemedText>
            </View>
          </>
        }
        contentContainerStyle={[styles.listContent, { backgroundColor: palette.background }]}
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <ThemedText style={{ color: palette.icon, textAlign: 'center', marginTop: 16 }}>
            No saved {tab.toLowerCase()}s yet. Add one above.
          </ThemedText>
        }
        renderItem={({ item }) => (
          <ThemedView style={[styles.entryCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={styles.entryHeader}>
              <ThemedText type="subtitle">₹{Number(item.amount).toLocaleString()}</ThemedText>
              <ThemedText style={{ color: palette.icon }}>{item.date}</ThemedText>
            </View>
            <ThemedText style={{ color: palette.icon }}>{item.category || 'Uncategorised'}</ThemedText>
            {item.notes ? <ThemedText style={{ color: palette.text }}>{item.notes}</ThemedText> : null}
            {item.tags ? (
              <ThemedText style={{ color: palette.icon }}>Tags: {item.tags}</ThemedText>
            ) : null}
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

const styles = logExpensesStyles;