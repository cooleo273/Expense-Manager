import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AddAccountScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [balance, setBalance] = useState('');

  const handleSave = () => {
    if (!accountName.trim()) {
      Alert.alert('Missing details', 'Please add an account name.');
      return;
    }
    Alert.alert('Account Added', `${accountName} (${accountType || 'Custom'}) saved with balance ₹${balance || '0'}.`);
    setAccountName('');
    setAccountType('');
    setBalance('');
  };

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: palette.background }]}> 
      <ThemedView style={styles.header}>
        <ThemedText type="title">Add account</ThemedText>
        <ThemedText style={{ color: palette.icon }}>Manual onboarding for banks, cards, wallets or cash.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.form}>
        <TextInput
          placeholder="Account name"
          value={accountName}
          onChangeText={setAccountName}
          style={[styles.input, { borderColor: palette.border, color: palette.text }]}
          placeholderTextColor={palette.icon}
        />
        <TextInput
          placeholder="Type (Bank, Card, Wallet, Cash)"
          value={accountType}
          onChangeText={setAccountType}
          style={[styles.input, { borderColor: palette.border, color: palette.text }]}
          placeholderTextColor={palette.icon}
        />
        <TextInput
          placeholder="Starting balance (₹)"
          value={balance}
          onChangeText={setBalance}
          keyboardType="numeric"
          style={[styles.input, { borderColor: palette.border, color: palette.text }]}
          placeholderTextColor={palette.icon}
        />
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: palette.tint }]} onPress={handleSave}>
          <ThemedText style={styles.saveButtonText}>Save account</ThemedText>
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
