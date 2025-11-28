import type { TransactionTypeValue } from '@/components/TransactionTypeFilter';

export type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date-desc', label: 'Date (desc)' },
  { value: 'date-asc', label: 'Date (asc)' },
  { value: 'amount-desc', label: 'Amount (desc)' },
  { value: 'amount-asc', label: 'Amount (asc)' },
];

export const DEFAULT_RECORD_TYPE: TransactionTypeValue = 'all';

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
