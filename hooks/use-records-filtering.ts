import { useMemo } from 'react';

import type { TransactionTypeValue } from '@/components/TransactionTypeFilter';
import { isSubcategoryId } from '@/constants/categories';
import { SORT_OPTIONS, type SortOption } from '@/constants/records';
import { useFilterContext } from '@/contexts/FilterContext';

import type { RecordsTransaction } from './use-records-data';

const matchesLabelsSearch = (labels: string[] | string | undefined, search: string) => {
  if (!labels) {
    return false;
  }
  if (Array.isArray(labels)) {
    return labels.some((label) => label.toLowerCase().includes(search));
  }
  return labels.toLowerCase().includes(search);
};

export const useRecordsFiltering = (
  transactions: RecordsTransaction[],
  sortOption: SortOption,
  selectedRecordType: TransactionTypeValue,
) => {
  const { filters } = useFilterContext();

  const filteredAndSortedData = useMemo(() => {
    const filtered = transactions.filter((item) => {
      if (filters.selectedAccount && filters.selectedAccount !== 'all' && item.accountId !== filters.selectedAccount) {
        return false;
      }

      if (selectedRecordType !== 'all' && selectedRecordType !== item.type) {
        return false;
      }

      if (filters.searchCategory && filters.searchCategory !== 'all' && filters.searchCategory !== item.type) {
        return false;
      }

      if (filters.selectedCategories.length > 0) {
        const matchesCategory = filters.selectedCategories.some((selectedId) => {
          if (isSubcategoryId(selectedId)) {
            return item.subcategoryId === selectedId;
          }
          return item.categoryId === selectedId;
        });
        if (!matchesCategory) {
          return false;
        }
      }

      if (filters.dateRange) {
        const itemDate = item.date;
        if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
          return false;
        }
      }

      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        if (
          !item.title.toLowerCase().includes(search) &&
          !(item.subtitle || '').toLowerCase().includes(search) &&
          !(item.payee && item.payee.toLowerCase().includes(search)) &&
          !(item.note && item.note.toLowerCase().includes(search)) &&
          !matchesLabelsSearch(item.labels, search)
        ) {
          return false;
        }
      }

      if (filters.selectedPayers && filters.selectedPayers.length > 0) {
        const payee = (item.payee || '').trim();
        if (!filters.selectedPayers.includes(payee)) {
          return false;
        }
      }

      if (filters.selectedLabels && filters.selectedLabels.length > 0) {
        const labels = (item.labels || []).map((label: string) => label.trim());
        const matches = filters.selectedLabels.some((selected) => labels.includes(selected));
        if (!matches) {
          return false;
        }
      }

      if (filters.keyTerms && filters.keyTerms.length > 0) {
        const text = `${item.title} ${item.note || ''} ${item.payee || ''} ${(item.labels || []).join(' ')}`.toLowerCase();
        const allTermsPresent = filters.keyTerms.every((term) => text.includes(term.toLowerCase()));
        if (!allTermsPresent) {
          return false;
        }
      }

      if (filters.amountRange) {
        const abs = Math.abs(item.amount);
        const min = filters.amountRange.min ?? 0;
        const max = filters.amountRange.max ?? Number.MAX_VALUE;
        if (abs < min || abs > max) {
          return false;
        }
      }

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          return b.date.getTime() - a.date.getTime();
        case 'date-asc':
          return a.date.getTime() - b.date.getTime();
        case 'amount-desc': {
          const absComparison = Math.abs(b.amount) - Math.abs(a.amount);
          if (absComparison !== 0) {
            return absComparison;
          }
          return b.amount - a.amount;
        }
        case 'amount-asc': {
          const absComparison = Math.abs(a.amount) - Math.abs(b.amount);
          if (absComparison !== 0) {
            return absComparison;
          }
          return a.amount - b.amount;
        }
        default:
          return 0;
      }
    });

    return sorted;
  }, [filters, transactions, sortOption, selectedRecordType]);

  const appliedFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.selectedAccount && filters.selectedAccount !== 'all') {
      count += 1;
    }
    if (selectedRecordType !== 'all') {
      count += 1;
    }
    if (filters.selectedCategories.length > 0) {
      count += 1;
    }
    if (filters.dateRange) {
      count += 1;
    }
    if (filters.amountRange && (filters.amountRange.min != null || filters.amountRange.max != null)) {
      count += 1;
    }
    if (filters.searchTerm) {
      count += 1;
    }
    if (filters.searchCategory && filters.searchCategory !== 'all') {
      count += 1;
    }
    if (filters.selectedPayers && filters.selectedPayers.length > 0) {
      count += 1;
    }
    if (filters.selectedLabels && filters.selectedLabels.length > 0) {
      count += 1;
    }
    if (filters.keyTerms && filters.keyTerms.length > 0) {
      count += 1;
    }
    return count;
  }, [filters, selectedRecordType]);

  const filterLabel =
    appliedFiltersCount > 0
      ? `${appliedFiltersCount} filter${appliedFiltersCount > 1 ? 's' : ''} applied`
      : 'All filters';

  const sortLabel = SORT_OPTIONS.find((option) => option.value === sortOption)?.label ?? 'Date (desc)';

  return {
    filters,
    filteredAndSortedData,
    appliedFiltersCount,
    filterLabel,
    sortLabel,
  };
};
