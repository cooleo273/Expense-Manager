import AsyncStorage from '@react-native-async-storage/async-storage';

import { resolveAccountId } from '@/constants/mock-data';

type LabelValue = string | string[] | null | undefined;

const normalizeLabels = (labels?: LabelValue): string[] | undefined => {
  if (!labels) {
    return undefined;
  }

  if (Array.isArray(labels)) {
    const cleaned = labels
      .map((label) => (typeof label === 'string' ? label.trim() : ''))
      .filter((label) => Boolean(label));
    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (typeof labels === 'string') {
    const cleaned = labels
      .split(',')
      .map((label) => label.trim())
      .filter((label) => label.length > 0);
    return cleaned.length > 0 ? cleaned : undefined;
  }

  return undefined;
};

export interface Transaction {
  id: string;
  title: string;
  account: string;
  accountId: string;
  note: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  icon: string;
  categoryId: string;
  subcategoryId?: string;
  userId?: string;
  labels?: string[];
  payee?: string;
}

const TRANSACTIONS_KEY = '@transactions';
const CATEGORY_USAGE_KEY = '@category_usage';

export class StorageService {
  static async getTransactions(): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      const parsed: Array<Transaction & { labels?: LabelValue }> = data ? JSON.parse(data) : [];
      return parsed.map((transaction) => ({
        ...transaction,
        accountId: resolveAccountId(transaction.accountId, transaction.account),
        labels: normalizeLabels(transaction.labels),
      }));
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }

  static async saveTransactions(transactions: Transaction[]): Promise<void> {
    try {
      const normalized = transactions.map((transaction) => ({
        ...transaction,
        labels: normalizeLabels(transaction.labels),
      }));
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(normalized));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  static async addTransaction(transaction: Transaction): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      transactions.push({
        ...transaction,
        accountId: resolveAccountId(transaction.accountId, transaction.account),
        labels: normalizeLabels(transaction.labels),
      });
      await this.saveTransactions(transactions);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  }

  static async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const index = transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        const nextAccount = updates.account ?? transactions[index].account;
        const nextAccountId = resolveAccountId(updates.accountId ?? transactions[index].accountId, nextAccount);
        const updatedLabels = normalizeLabels((updates as { labels?: LabelValue }).labels ?? transactions[index].labels);
        transactions[index] = {
          ...transactions[index],
          ...updates,
          account: nextAccount,
          accountId: nextAccountId,
          labels: updatedLabels,
        };
        await this.saveTransactions(transactions);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  }

  static async deleteTransaction(id: string): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const filtered = transactions.filter(t => t.id !== id);
      await this.saveTransactions(filtered);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  }

  static async addBatchTransactions(newTransactions: Transaction[]): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      transactions.push(
        ...newTransactions.map((transaction) => ({
          ...transaction,
          accountId: resolveAccountId(transaction.accountId, transaction.account),
          labels: normalizeLabels(transaction.labels),
        }))
      );
      await this.saveTransactions(transactions);
    } catch (error) {
      console.error('Error adding batch transactions:', error);
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TRANSACTIONS_KEY);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  static async getCategoryUsage(): Promise<Record<string, number>> {
    try {
      const value = await AsyncStorage.getItem(CATEGORY_USAGE_KEY);
      return value ? JSON.parse(value) : {};
    } catch (error) {
      console.error('Error loading category usage:', error);
      return {};
    }
  }

  static async incrementCategoryUsage(categoryId: string): Promise<void> {
    try {
      const current = await this.getCategoryUsage();
      const next = { ...current } as Record<string, number>;
      next[categoryId] = (next[categoryId] ?? 0) + 1;
      await AsyncStorage.setItem(CATEGORY_USAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Error incrementing category usage:', error);
    }
  }

  static async setCategoryUsage(usage: Record<string, number>): Promise<void> {
    try {
      await AsyncStorage.setItem(CATEGORY_USAGE_KEY, JSON.stringify(usage));
    } catch (error) {
      console.error('Error setting category usage:', error);
    }
  }
}