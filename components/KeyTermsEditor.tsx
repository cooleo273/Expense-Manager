import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function KeyTermsEditor({ terms, onChange }: { terms: string[]; onChange: (terms: string[]) => void }) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const [input, setInput] = useState('');

  const addTerm = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onChange([...terms, trimmed]);
    setInput('');
  };

  const removeTerm = (value: string) => {
    onChange(terms.filter((t) => t !== value));
  };

  return (
    <ThemedView style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Add key term"
          placeholderTextColor={palette.icon}
          style={{ flex: 1, padding: 12, borderWidth: 1, borderColor: palette.border, borderRadius: 8 }}
        />
        <TouchableOpacity onPress={addTerm} style={{ paddingVertical: 12, paddingHorizontal: 16, backgroundColor: palette.tint, borderRadius: 8 }}>
          <ThemedText style={{ color: 'white', fontWeight: '700' }}>ADD</ThemedText>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
        {terms.map((t) => (
          <TouchableOpacity key={t} onPress={() => removeTerm(t)} style={{ padding: 8, borderRadius: 8, borderWidth: 1, borderColor: palette.border }}>
            <ThemedText style={{ color: palette.text }}>{t}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );
}
