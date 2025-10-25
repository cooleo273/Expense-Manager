import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const sections = [
  {
    title: 'Insights',
    items: [
      { id: 'budget', label: 'Budget Analysis', icon: 'chart-pie', href: '/budget-analysis' },
      { id: 'reminders', label: 'Reminders', icon: 'bell-alert', href: '/reminders' },
      { id: 'transactions', label: 'All Transactions', icon: 'history', href: '/transactions' },
    ],
  },
  {
    title: 'Account & Support',
    items: [
      { id: 'profile', label: 'Profile & Security', icon: 'account-cog', href: '/settings' },
      { id: 'help', label: 'Help Center', icon: 'lifebuoy', href: '/support' },
    ],
  },
];

export default function MoreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={[styles.safeArea, { backgroundColor: palette.background }]}> 
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: palette.background }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title">More</ThemedText>
          <ThemedText style={{ color: palette.icon }}>Customize Splash to match your finance goals</ThemedText>
        </View>

        {sections.map((section) => (
          <ThemedView key={section.title} style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}> 
            <ThemedText type="subtitle" style={styles.cardTitle}>{section.title}</ThemedText>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.row}
                onPress={() => router.push(item.href as never)}
                accessibilityRole="button"
              >
                <View style={[styles.iconCircle, { backgroundColor: `${palette.tint}1A` }]}> 
                  <MaterialCommunityIcons name={item.icon as never} size={20} color={palette.tint} />
                </View>
                <ThemedText style={styles.label}>{item.label}</ThemedText>
                <MaterialCommunityIcons name="chevron-right" size={20} color={palette.icon} />
              </TouchableOpacity>
            ))}
          </ThemedView>
        ))}
      </ScrollView>
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
    gap: 8,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
});