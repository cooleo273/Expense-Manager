import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const initialReminders = [
  { id: '1', title: 'Monthly Rent', amount: 25000, schedule: 'Repeats monthly · 05 Mar 10:00' },
  { id: '2', title: 'Netflix Subscription', amount: 649, schedule: 'Repeats monthly · 08 Mar 11:00' },
  { id: '3', title: 'Amazon Prime', amount: 1499, schedule: 'Repeats yearly · 20 Apr 13:30' },
];

export default function RemindersScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [reminders, setReminders] = useState(initialReminders);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  const handleAddReminder = () => {
    if (!title.trim() || !amount.trim()) {
      return;
    }
    setReminders((prev) => [
      {
        id: Date.now().toString(),
        title: title.trim(),
        amount: Number(amount) || 0,
        schedule: 'One-time reminder · Custom',
      },
      ...prev,
    ]);
    setTitle('');
    setAmount('');
  };

  return (
    <ThemedView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <FlatList
        contentContainerStyle={[styles.content, { backgroundColor: palette.background }]}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="title">Reminders</ThemedText>
            <ThemedText style={{ color: palette.icon }}>
              Create manual nudges for recurring expenses or incomes.
            </ThemedText>
            <View style={styles.form}>
              <TextInput
                placeholder="Reminder title"
                value={title}
                onChangeText={setTitle}
                style={[styles.input, { borderColor: palette.border, color: palette.text }]}
                placeholderTextColor={palette.icon}
              />
              <TextInput
                placeholder="Amount (₹)"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={[styles.input, { borderColor: palette.border, color: palette.text }]}
                placeholderTextColor={palette.icon}
              />
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: palette.tint }]}
                onPress={handleAddReminder}
              >
                <ThemedText style={styles.addButtonText}>Add Reminder</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        }
        data={reminders}
        renderItem={({ item }) => (
          <ThemedView style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}> 
            <View style={styles.cardRow}>
              <ThemedText type="subtitle">{item.title}</ThemedText>
              <ThemedText>₹{item.amount.toLocaleString()}</ThemedText>
            </View>
            <ThemedText style={{ color: palette.icon }}>{item.schedule}</ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/log-expenses')}
              style={[styles.linkButton, { borderColor: palette.border }]}
            >
              <ThemedText style={{ color: palette.tint }}>Log a matching transaction</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
        keyExtractor={(item) => item.id}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    gap: 12,
    marginBottom: 8,
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  addButton: {
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
});
