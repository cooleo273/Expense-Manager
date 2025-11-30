import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AddAccountScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [balance, setBalance] = useState('');

  const handleSave = () => {
    if (!accountName.trim()) {
      Alert.alert(t('missing_details'), t('add_account_name_alert'));
      return;
    }
    Alert.alert(t('account_added'), `${accountName} (${accountType || t('custom')}) saved with balance ₹${balance || '0'}.`);
    setAccountName('');
    setAccountType('');
    setBalance('');
  };

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: palette.background }]}> 
      <ThemedView style={styles.header}>
        <ThemedText type="title">{t('add_account')}</ThemedText>
        <ThemedText style={{ color: palette.icon }}>{t('manual_onboarding_message')}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.form}>
        <TextInput
          placeholder={t('account_name')}
          value={accountName}
          onChangeText={setAccountName}
          style={[styles.input, { borderColor: palette.border, color: palette.text }]}
          placeholderTextColor={palette.icon}
        />
        <TextInput
          placeholder={t('account_type_placeholder')}
          value={accountType}
          onChangeText={setAccountType}
          style={[styles.input, { borderColor: palette.border, color: palette.text }]}
          placeholderTextColor={palette.icon}
        />
        <TextInput
          placeholder={t('starting_balance_placeholder')}
          value={balance}
          onChangeText={setBalance}
          keyboardType="numeric"
          style={[styles.input, { borderColor: palette.border, color: palette.text }]}
          placeholderTextColor={palette.icon}
        />
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: palette.tint }]} onPress={handleSave}>
          <ThemedText style={styles.saveButtonText}>{t('save')}</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 20,
  },
  header: {
    gap: 8,
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
