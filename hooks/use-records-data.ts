import { useCallback, useEffect, useMemo, useState } from 'react';

import { mockRecordsData, resolveAccountId } from '@/constants/mock-data';
import type { Transaction } from '@/services/storage';
import { StorageService } from '@/services/storage';

export type RecordsTransaction = Transaction & {
  subtitle?: string;
  date: Date;
  dateLabel?: string;
};

type RawTransaction = Transaction & {
  date: string | Date;
  subtitle?: string;
};

const normalizeDate = (value: string | Date) => (value instanceof Date ? value : new Date(value));

const transformTransactions = (transactions: RawTransaction[]): RecordsTransaction[] => {
  return transactions.map((transaction) => {
    const subtitle = transaction.subtitle
      ? transaction.subtitle
      : `${transaction.categoryId}${transaction.subcategoryId ? ` - ${transaction.subcategoryId}` : ''}`;

    return {
      ...transaction,
      accountId: resolveAccountId(transaction.accountId, transaction.account),
      subtitle,
      date: normalizeDate(transaction.date),
    } as RecordsTransaction;
  });
};

export const useRecordsData = () => {
  const [transactions, setTransactions] = useState<RecordsTransaction[]>([]);

  const loadTransactions = useCallback(async () => {
    try {
      const data = await StorageService.getTransactions();
      if (data.length === 0) {
        setTransactions(transformTransactions(mockRecordsData as unknown as RawTransaction[]));
        return;
      }
      setTransactions(transformTransactions(data as RawTransaction[]));
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions(transformTransactions(mockRecordsData as unknown as RawTransaction[]));
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    const unsubscribe = StorageService.subscribeTransactions(() => {
      loadTransactions();
    });
    return unsubscribe;
  }, [loadTransactions]);

  const maxTransactionAbs = useMemo(() => {
    if (transactions.length === 0) {
      return 100;
    }
    return Math.max(100, ...transactions.map((t) => Math.abs(t.amount || 0)));
  }, [transactions]);

  const uniquePayers = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach((transaction) => {
      const candidate = (transaction.payee || transaction.account || transaction.title || '').toString().trim();
      if (!candidate) {
        return;
      }
      counts[candidate] = (counts[candidate] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([payee]) => payee);
  }, [transactions]);

  const uniqueLabels = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach((transaction) => {
      (transaction.labels || []).forEach((label: string) => {
        const key = label.trim();
        if (!key) {
          return;
        }
        counts[key] = (counts[key] ?? 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label]) => label);
  }, [transactions]);

  return {
    transactions,
    refreshTransactions: loadTransactions,
    maxTransactionAbs,
    uniquePayers,
    uniqueLabels,
  };
};
