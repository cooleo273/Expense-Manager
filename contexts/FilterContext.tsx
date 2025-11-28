import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';


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
  selectedCategories: string[];
  amountRange?: { min?: number | null; max?: number | null } | null; // null means no amount filter
  selectedPayers?: string[]; // payee values
  selectedLabels?: string[];
  keyTerms?: string[]; // free-text tokens user may add for filtering
  tempSelectedCategories: string[]; // temp for filter modal
};
  // recentResults: { id: string; record: any }[];


const defaultFilterState: FilterState = {
  selectedAccount: 'all',
  searchTerm: '',
  dateRange: null,
  searchHistory: [],
  searchCategory: 'all',
  selectedCategories: [],
  amountRange: null,
  selectedPayers: [],
  selectedLabels: [],
  keyTerms: [],
  tempSelectedCategories: [],
  // recentResults: [],
};


type FilterContextType = {
  filters: FilterState;
  setSelectedAccount: (account: string) => void;
  setSearchTerm: (term: string) => void;
  setDateRange: (range: DateRange | null) => void;
  addToSearchHistory: (term: string) => void;
  setSearchCategory: (category: 'all' | 'income' | 'expense') => void;
  setSelectedCategories: (categories: string[]) => void;
  setAmountRange: (range: { min?: number | null; max?: number | null } | null) => void;
  setSelectedPayers: (payers: string[]) => void;
  setSelectedLabels: (labels: string[]) => void;
  setKeyTerms: (terms: string[]) => void;
  setTempSelectedCategories: (categories: string[]) => void;
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


  // Load search history from AsyncStorage on mount
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem('searchHistory');
        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory);
          setFilters(prev => ({ ...prev, searchHistory: parsedHistory }));
        }
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    };
    loadSearchHistory();
  }, []);


  // Save search history to AsyncStorage whenever it changes
  useEffect(() => {
    const saveSearchHistory = async () => {
      try {
        await AsyncStorage.setItem('searchHistory', JSON.stringify(filters.searchHistory));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }
    };
    saveSearchHistory();
  }, [filters.searchHistory]);


  const setSelectedAccount = (account: string) => {
    setFilters(prev => ({ ...prev, selectedAccount: account }));
  };


  const setSearchTerm = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  };


  const setDateRange = (range: DateRange | null) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };


  const setAmountRange = (range: { min?: number | null; max?: number | null } | null) => {
    setFilters(prev => ({ ...prev, amountRange: range }));
  };


  const setSelectedPayers = (payers: string[]) => {
    setFilters(prev => ({ ...prev, selectedPayers: payers }));
  };


  const setSelectedLabels = (labels: string[]) => {
    setFilters(prev => ({ ...prev, selectedLabels: labels }));
  };


  const setKeyTerms = (terms: string[]) => {
    setFilters(prev => ({ ...prev, keyTerms: terms }));
  };


  const setSearchCategory = (category: 'all' | 'income' | 'expense') => {
    setFilters(prev => ({ ...prev, searchCategory: category }));
  };


  const addToSearchHistory = (term: string) => {
    const normalized = term.trim();
    if (!normalized) {
      return;
    }
    setFilters(prev => {
      const existing = prev.searchHistory.filter(entry => entry.toLowerCase() !== normalized.toLowerCase());
      return {
        ...prev,
        searchHistory: [normalized, ...existing].slice(0, 5),
      };
    });
  };


  const setSelectedCategories = (categories: string[]) => {
    setFilters(prev => ({ ...prev, selectedCategories: categories }));
  };


  const setTempSelectedCategories = (categories: string[]) => {
    setFilters(prev => ({ ...prev, tempSelectedCategories: categories }));
  };


  const resetFilters = () => {
    setFilters({ ...defaultFilterState, amountRange: null });
  };


  return (
    <FilterContext.Provider
      value={{
        filters,
        setSelectedAccount,
        setSearchTerm,
        setDateRange,
        setSearchCategory,
        setSelectedCategories,
        addToSearchHistory,
        setAmountRange,
        setSelectedPayers,
        setSelectedLabels,
        setKeyTerms,
        setTempSelectedCategories,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
