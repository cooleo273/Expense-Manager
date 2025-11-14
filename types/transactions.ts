import { TransactionTypeValue } from '@/components/TransactionTypeFilter';

export type RecordType = Exclude<TransactionTypeValue, 'all'>;

export type SingleDraft = {
  amount: string;
  category: string;
  subcategoryId?: string;
  payee: string;
  note: string;
  labels: string[];
};

export type BatchDraft = {
  id: string;
  note: string;
  category: string;
  subcategoryId?: string;
  amount: string;
};

export type StoredRecord = {
  id: string;
  type: RecordType;
  amount: number;
  category: string;
  subcategoryId?: string;
  payee?: string;
  note?: string;
  labels?: string[];
  accountId: string;
  occurredAt: string;
};

export const DEFAULT_CATEGORY = 'housing';

export const INITIAL_SINGLE_DRAFT: SingleDraft = {
  amount: '',
  category: DEFAULT_CATEGORY,
  payee: '',
  note: '',
  labels: [],
};

export const createBatchDraft = (defaultCategory: string = DEFAULT_CATEGORY): BatchDraft => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  note: '',
  category: defaultCategory,
  amount: '',
});
