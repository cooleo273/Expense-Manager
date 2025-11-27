import React from 'react';
import { Linking, StyleSheet, TouchableOpacity, View, Image, ScrollView, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SupportScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams<{ legacy?: string }>();
  const isLegacy = params.legacy === 'true';
  const router = useRouter();

  return (
    <ThemedView style={[styles.safeArea, { backgroundColor: palette.background }]}> 
      <ScrollView contentContainerStyle={{ gap: 16 }}>
        <View style={styles.header}>
        <ThemedText type="title">Help Center</ThemedText>
        <ThemedText style={{ color: palette.icon }}>
          Find quick answers, guides, and contact support.
        </ThemedText>
      </View>

        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}> 
          <ThemedText type="subtitle">Contact Us</ThemedText>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:support@splashfinance.app')}>
            <ThemedText style={{ color: palette.tint }}>support@splashfinance.app</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('tel:+18005551234')}>
            <ThemedText style={{ color: palette.tint }}>+1 (800) 555-1234</ThemedText>
          </TouchableOpacity>
          <ThemedText type="subtitle">FAQ</ThemedText>
          <ThemedText style={{ color: palette.icon }}>Q: How do I add an expense?</ThemedText>
          <ThemedText style={{ color: palette.icon }}>A: Tap the + button from the homepage and select Expense.</ThemedText>
          <ThemedText style={{ color: palette.icon }}>Q: How can I export my data?</ThemedText>
          <ThemedText style={{ color: palette.icon }}>A: Go to Settings {'>'} Export Data.</ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}> 
          <ThemedText type="subtitle">Troubleshooting</ThemedText>
          <ThemedText style={{ color: palette.icon }}>If you’re experiencing issues, try closing the app and restarting, or verify your storage permissions.</ThemedText>
          <Button title="Visit Support Site" onPress={() => Linking.openURL('https://example.com/support')} />
        </View>

        {isLegacy && (
          <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}> 
            <ThemedText type="subtitle">Legacy Expense Manager</ThemedText>
            <ThemedText style={{ color: palette.icon }}>Here is a screenshot of the older Expense Manager UI:</ThemedText>
            <Image
              source={require('../assets/images/expense-manager.jpg')}
              style={styles.legacyImage}
              resizeMode="contain"
            />
            <ThemedText style={{ color: palette.icon }}>This mode shows a legacy UI screenshot preserved for nostalgic reasons.</ThemedText>
            <Button title="Back to Modern UI" onPress={() => router.push('/')} />
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  header: {
    gap: Spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  legacyImage: {
    width: '100%',
    height: 220,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    backgroundColor: '#fff',
  },
});
