import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { type ComponentProps } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const quickActionButtons: Array<{ id: string; label: string; icon: MaterialIconName; tint: string }> = [
  { id: 'log-expense', label: 'Log Expense', icon: 'note-edit-outline' as MaterialIconName, tint: '#F97316' },
  { id: 'scan-receipt', label: 'Scan Receipt', icon: 'camera-outline' as MaterialIconName, tint: '#60A5FA' },
  { id: 'create-reminder', label: 'Add Reminder', icon: 'bell-outline' as MaterialIconName, tint: '#34D399' },
];

const upcomingReminders: Array<{
  id: string;
  title: string;
  date: string;
  amount: number;
  icon: MaterialIconName;
}> = [
  {
    id: 'rent',
    title: 'Monthly Rent',
    date: '05 Mar · 10:00',
    amount: 25000,
    icon: 'home-city-outline' as MaterialIconName,
  },
  {
    id: 'netflix',
    title: 'Netflix Subscription',
    date: '08 Mar · 11:00',
    amount: 649,
    icon: 'television-play' as MaterialIconName,
  },
];

const recentTransactions: Array<{
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  icon: MaterialIconName;
}> = [
  {
    id: 'amazon',
    title: 'Amazon',
    subtitle: 'Shopping',
    amount: -1050,
    icon: 'cart-outline' as MaterialIconName,
  },
  {
    id: 'salary',
    title: 'Salary',
    subtitle: 'Income',
    amount: 50000,
    icon: 'wallet-plus-outline' as MaterialIconName,
  },
  {
    id: 'coffee',
    title: 'Cafe Aroma',
    subtitle: 'Food & Drinks',
    amount: -320,
    icon: 'coffee-outline' as MaterialIconName,
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const formatAmount = (value: number) => `${value >= 0 ? '+' : '-'}₹${Math.abs(value).toLocaleString()}`;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: palette.background }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={[styles.heroCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.heroHeader}>
            <View>
              <ThemedText type="title">Splash Finance</ThemedText>
              <ThemedText style={{ color: palette.icon }}>Hello, Priya · Feb 2024 snapshot</ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.avatar, { backgroundColor: palette.tint }]}
              accessibilityRole="button"
            >
              <ThemedText style={styles.avatarLabel}>P</ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedText style={{ color: palette.icon, marginTop: 8 }}>Total Balance</ThemedText>
          <ThemedText type="title" style={styles.balanceValue}>
            ₹57,550
          </ThemedText>
          <View style={styles.balanceRow}>
            <View>
              <ThemedText style={{ color: palette.icon }}>Income this month</ThemedText>
              <ThemedText style={styles.balanceMetric}>₹82,000</ThemedText>
            </View>
            <View>
              <ThemedText style={{ color: palette.icon }}>Spends this month</ThemedText>
              <ThemedText style={styles.balanceMetric}>₹24,450</ThemedText>
            </View>
          </View>
        </ThemedView>

        <ThemedView style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Quick Actions</ThemedText>
            <ThemedText style={{ color: palette.icon }}>Stay on top of tasks</ThemedText>
          </View>
          <View style={styles.actionsRow}>
            {quickActionButtons.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionPill, { backgroundColor: `${action.tint}1A` }]}
                accessibilityRole="button"
                onPress={() => {
                  if (action.id === 'log-expense') {
                    router.push('/log-expenses');
                  } else if (action.id === 'scan-receipt') {
                    router.push('/(tabs)/scan');
                  } else {
                    router.push('/reminders');
                  }
                }}
              >
                <MaterialCommunityIcons name={action.icon} size={20} color={action.tint} />
                <ThemedText style={{ color: palette.text }}>{action.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        <ThemedView style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Upcoming Reminders</ThemedText>
            <TouchableOpacity onPress={() => router.push('/reminders')} accessibilityRole="button"> 
              <ThemedText style={{ color: palette.tint }}>See all</ThemedText>
            </TouchableOpacity>
          </View>
          {upcomingReminders.map((reminder) => (
            <View key={reminder.id} style={styles.listRow}>
              <View style={[styles.iconCircle, { backgroundColor: `${palette.tint}1A` }]}> 
                <MaterialCommunityIcons name={reminder.icon} size={20} color={palette.tint} />
              </View>
              <View style={styles.listText}>
                <ThemedText>{reminder.title}</ThemedText>
                <ThemedText style={{ color: palette.icon }}>{reminder.date}</ThemedText>
              </View>
              <ThemedText style={styles.listAmount}>₹{reminder.amount.toLocaleString()}</ThemedText>
            </View>
          ))}
        </ThemedView>

        <ThemedView style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Recent Transactions</ThemedText>
            <TouchableOpacity onPress={() => router.push('/transactions')} accessibilityRole="button"> 
              <ThemedText style={{ color: palette.tint }}>View history</ThemedText>
            </TouchableOpacity>
          </View>
          {recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.listRow}>
              <View style={[styles.iconCircle, { backgroundColor: `${palette.tint}1A` }]}> 
                <MaterialCommunityIcons name={transaction.icon} size={20} color={palette.tint} />
              </View>
              <View style={styles.listText}>
                <ThemedText>{transaction.title}</ThemedText>
                <ThemedText style={{ color: palette.icon }}>{transaction.subtitle}</ThemedText>
              </View>
              <ThemedText
                style={[
                  styles.listAmount,
                  { color: transaction.amount >= 0 ? palette.success : palette.error },
                ]}
              >
                {formatAmount(transaction.amount)}
              </ThemedText>
            </View>
          ))}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
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
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  balanceMetric: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 12,
  },
  listText: {
    flex: 1,
  },
  listAmount: {
    fontWeight: '600',
  },
});