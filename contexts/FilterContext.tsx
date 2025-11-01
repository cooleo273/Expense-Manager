import React, { createContext, ReactNode, useContext, useState } from 'react';

export type DateRange = {
  start: Date;
  end: Date;
};

export type FilterState = {
  selectedAccount: string; // 'all' or account id
  searchTerm: string;
  dateRange: DateRange | null; // null means all time
  searchHistory: string[];
  searchCategory: 'all' | 'income' | 'expense';
};

const defaultFilterState: FilterState = {
  selectedAccount: 'all',
  searchTerm: '',
  dateRange: null,
  searchHistory: [],
  searchCategory: 'all',
};

type FilterContextType = {
  filters: FilterState;
  setSelectedAccount: (account: string) => void;
  setSearchTerm: (term: string) => void;
  setDateRange: (range: DateRange | null) => void;
  addToSearchHistory: (term: string) => void;
  setSearchCategory: (category: 'all' | 'income' | 'expense') => void;
  resetFilters: () => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);

  const setSelectedAccount = (account: string) => {
    setFilters(prev => ({ ...prev, selectedAccount: account }));
  };

  const setSearchTerm = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  };

  const setDateRange = (range: DateRange | null) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };

  const setSearchCategory = (category: 'all' | 'income' | 'expense') => {
    setFilters(prev => ({ ...prev, searchCategory: category }));
  };

  const addToSearchHistory = (term: string) => {
    if (term.trim() && !filters.searchHistory.includes(term.trim())) {
      setFilters(prev => ({
        ...prev,
        searchHistory: [term.trim(), ...prev.searchHistory.slice(0, 9)] // Keep last 10
      }));
    }
  };

  const resetFilters = () => {
    setFilters(defaultFilterState);
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setSelectedAccount,
        setSearchTerm,
        setDateRange,
        setSearchCategory,
        addToSearchHistory,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};