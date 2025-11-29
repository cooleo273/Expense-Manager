import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, FontWeights, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { mockInitialReminders } from '../constants/mock-data';

export default function RemindersScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [reminders, setReminders] = useState(mockInitialReminders);
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
            <ThemedText type="title">{t('reminders')}</ThemedText>
            <ThemedText style={{ color: palette.icon }}>
              Create manual nudges for recurring expenses or incomes.
            </ThemedText>
            <View style={styles.form}>
              <TextInput
                placeholder={t('reminder_title_placeholder')}
                value={title}
                onChangeText={setTitle}
                style={[styles.input, { borderColor: palette.border, color: palette.text }]}
                placeholderTextColor={palette.icon}
              />
              <TextInput
                placeholder={t('amount_placeholder')}
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
                <ThemedText style={styles.addButtonText}>{t('add_record')}</ThemedText>
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
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  header: {
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  form: {
    gap: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  addButton: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: FontWeights.semibold as any,
  },
  card: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
});
