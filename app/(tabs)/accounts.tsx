import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState, type ComponentProps } from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type MaterialCommunityIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const summaryCards: Array<{
  id: string;
  label: string;
  amount: number;
  icon: MaterialCommunityIconName;
}> = [
  { id: 'available', label: 'Available Balance', amount: 144653, icon: 'wallet-outline' },
  { id: 'credit', label: 'Available Credit', amount: 89861, icon: 'credit-card-outline' },
];

const accountGroups: Array<{
  id: string;
  title: string;
  icon: MaterialCommunityIconName;
  accounts: Array<{ id: string; name: string; balance: number }>;
}> = [
  {
    id: 'bank-accounts',
    title: 'Bank Accounts',
    icon: 'office-building',
    accounts: [
      { id: 'icici-bank', name: 'ICICI Bank', balance: 56050 },
      { id: 'sbi-bank', name: 'SBI Bank', balance: 78053 },
    ],
  },
  {
    id: 'credit-cards',
    title: 'Credit Cards',
    icon: 'credit-card-chip-outline',
    accounts: [
      { id: 'axis-card', name: 'Axis Card', balance: 40806 },
      { id: 'icici-card', name: 'ICICI Card', balance: 49055 },
    ],
  },
  {
    id: 'wallets',
    title: 'Wallets',
    icon: 'wallet',
    accounts: [{ id: 'paytm', name: 'Paytm', balance: 750 }],
  },
  {
    id: 'cash',
    title: 'Cash',
    icon: 'cash',
    accounts: [{ id: 'cash', name: 'Cash', balance: 9800 }],
  },
];

export default function AccountsScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const [showBalances, setShowBalances] = useState(true);
  const router = useRouter();

  const totalAccounts = useMemo(
    () => accountGroups.reduce((count, group) => count + group.accounts.length, 0),
    []
  );

  const formatAmount = (amount: number) => (showBalances ? `₹${amount.toLocaleString()}` : '••••••');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: palette.background }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.hero}>
          <ThemedText type="title">All Accounts</ThemedText>
          <ThemedText style={{ color: palette.icon }}>One secure place for every balance</ThemedText>
          <View style={styles.heroRow}>
            <ThemedText style={{ color: palette.icon }}>Transactions based balance, may vary.</ThemedText>
            <TouchableOpacity
              style={[styles.addButton, { borderColor: palette.border }]}
              accessibilityRole="button"
              onPress={() => router.push('/add-account')}
            >
              <MaterialCommunityIcons name="plus" size={18} color={palette.text} />
              <ThemedText style={styles.addButtonLabel}>Add account</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.toggleRow}>
            <ThemedText style={{ color: palette.icon }}>Show balance</ThemedText>
            <Switch
              value={showBalances}
              onValueChange={setShowBalances}
              trackColor={{ false: palette.border, true: palette.tint }}
              thumbColor={palette.background}
            />
          </View>
          <ThemedText style={{ color: palette.icon }}>{totalAccounts} linked accounts</ThemedText>
        </ThemedView>

        <View style={styles.summaryRow}>
          {summaryCards.map((card) => (
            <ThemedView
              key={card.id}
              style={[
                styles.summaryCard,
                { backgroundColor: palette.card, borderColor: palette.border },
              ]}
            >
              <View style={styles.summaryIcon}>
                <MaterialCommunityIcons name={card.icon} size={20} color={palette.tint} />
              </View>
              <ThemedText style={{ color: palette.icon }}>{card.label}</ThemedText>
              <ThemedText type="title" style={styles.summaryValue}>
                {formatAmount(card.amount)}
              </ThemedText>
            </ThemedView>
          ))}
        </View>

        {accountGroups.map((group) => (
          <ThemedView
            key={group.id}
            style={[styles.groupCard, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <View style={styles.groupHeader}>
              <View style={styles.groupTitleRow}>
                <MaterialCommunityIcons name={group.icon} size={18} color={palette.tint} />
                <ThemedText type="subtitle">{group.title}</ThemedText>
              </View>
              <ThemedText style={{ color: palette.icon }}>{group.accounts.length} accounts</ThemedText>
            </View>
            {group.accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={styles.accountRow}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/account/[accountId]', params: { accountId: account.id } })}
              >
                <View>
                  <ThemedText>{account.name}</ThemedText>
                  <ThemedText style={{ color: palette.icon }}>Auto-sync enabled</ThemedText>
                </View>
                <View style={styles.accountValueRow}>
                  <ThemedText style={styles.accountBalance}>{formatAmount(account.balance)}</ThemedText>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={palette.icon} />
                </View>
              </TouchableOpacity>
            ))}
          </ThemedView>
        ))}
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
    paddingBottom: 120,
    gap: 16,
  },
  hero: {
    gap: 12,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  addButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(96,165,250,0.15)',
  },
  summaryValue: {
    marginTop: 4,
  },
  groupCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
  },
  accountValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountBalance: {
    fontWeight: '600',
  },
});