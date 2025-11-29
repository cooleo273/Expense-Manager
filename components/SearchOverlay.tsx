import { TransactionTypeFilter } from '@/components/TransactionTypeFilter';
import { getNodeDisplayName } from '@/constants/categories';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StorageService } from '@/services/storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import RecordList from './RecordList';

type SearchOverlayProps = {
  visible: boolean;
  onClose: () => void;
};

const DRAWER_MAX_HEIGHT = Math.min(Dimensions.get('window').height * 0.85, 640);

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const { filters, addToSearchHistory, setSearchCategory } = useFilterContext();
  const [tempSearch, setTempSearch] = useState(filters.searchTerm);
  const [results, setResults] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const router = useRouter();
  const displayResults = useMemo(() => results.slice(0, 5), [results]);
  const insets = useSafeAreaInsets();
  const drawerTranslate = useRef(new Animated.Value(-DRAWER_MAX_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const isClosingRef = useRef(false);
  const lastRecordedQueryRef = useRef('');
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setTempSearch(filters.searchTerm);
    }
  }, [filters.searchTerm, visible]);

  useEffect(() => {
    if (!visible) {
      drawerTranslate.setValue(-DRAWER_MAX_HEIGHT);
      backdropOpacity.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.spring(drawerTranslate, {
        toValue: 0,
        damping: 18,
        stiffness: 220,
        mass: 0.9,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      isClosingRef.current = false;
    });
  }, [backdropOpacity, drawerTranslate, visible]);

  const animateClose = () => {
    if (isClosingRef.current) {
      return;
    }
    isClosingRef.current = true;
    Animated.parallel([
      Animated.timing(drawerTranslate, {
        toValue: -DRAWER_MAX_HEIGHT,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  useEffect(() => {
    const trimmed = tempSearch.trim();
    if (!trimmed) {
      setResults([]);
      setLoadingResults(false);
      lastRecordedQueryRef.current = '';
      if (historyTimerRef.current) {
        clearTimeout(historyTimerRef.current);
        historyTimerRef.current = null;
      }
      return;
    }

    let canceled = false;
    const doSearch = async () => {
      setLoadingResults(true);
      try {
        const txns = await StorageService.getTransactions();
        const normalizedQuery = trimmed.toLowerCase();
        const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
        const filtered = txns.filter((t: any) => {
          if (filters.searchCategory && filters.searchCategory !== 'all' && t.type !== filters.searchCategory) {
            return false;
          }
          const categoryName = getNodeDisplayName(t.subcategoryId) ?? getNodeDisplayName(t.categoryId) ?? '';
          const accountName = (t.account || '').toLowerCase();
          const title = (t.title || '').toLowerCase();
          const note = (t.note || '').toLowerCase();
          const payee = (t.payee || '').toLowerCase();
          const labels = ((t.labels || []) as string[]).map((l) => l.toLowerCase()).join(' ');
          const matchesToken = (token: string) => {
            return (
              title.includes(token) ||
              note.includes(token) ||
              payee.includes(token) ||
              accountName.includes(token) ||
              categoryName.toLowerCase().includes(token) ||
              labels.includes(token)
            );
          };
          return queryTokens.length === 0 ? false : queryTokens.every(matchesToken);
        });
        if (!canceled) {
          setResults(filtered);
        }
      } catch (err) {
        console.error('Search failed', err);
        if (!canceled) {
          setResults([]);
        }
      } finally {
        if (!canceled) {
          setLoadingResults(false);
        }
      }
    };

    const timer = setTimeout(doSearch, 350);
    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [tempSearch, filters.searchCategory]);

  useEffect(() => {
    const trimmed = tempSearch.trim();

    if (!trimmed) {
      if (historyTimerRef.current) {
        clearTimeout(historyTimerRef.current);
        historyTimerRef.current = null;
      }
      lastRecordedQueryRef.current = '';
      return;
    }

    const normalized = trimmed.toLowerCase();

    if (normalized === lastRecordedQueryRef.current) {
      if (historyTimerRef.current) {
        clearTimeout(historyTimerRef.current);
        historyTimerRef.current = null;
      }
      return;
    }

    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
    }

    const timer = setTimeout(() => {
      addToSearchHistory(trimmed);
      lastRecordedQueryRef.current = normalized;
      historyTimerRef.current = null;
    }, 1500);

    historyTimerRef.current = timer;

    return () => {
      clearTimeout(timer);
      if (historyTimerRef.current === timer) {
        historyTimerRef.current = null;
      }
    };
  }, [tempSearch, addToSearchHistory]);

  const handleSelectHistory = (term: string) => {
    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
    }
    const trimmed = term.trim();
    setTempSearch(term);
    if (trimmed) {
      addToSearchHistory(trimmed);
      lastRecordedQueryRef.current = trimmed.toLowerCase();
    }
  };

  const handleSelectCategory = (category: 'all' | 'income' | 'expense') => {
    setSearchCategory(category);
  };

  const handleClearSearch = () => {
    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
    }
    lastRecordedQueryRef.current = '';
    setTempSearch('');
  };

  const openRecordDetail = (record: any) => {
    const trimmedQuery = tempSearch.trim();
    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
    }
    const payload = encodeURIComponent(
      JSON.stringify({
        ...record,
        occurredAt:
          record.date instanceof Date ? record.date.toISOString() : new Date(record.date).toISOString(),
      })
    );
    if (trimmedQuery) {
      addToSearchHistory(trimmedQuery);
      lastRecordedQueryRef.current = trimmedQuery.toLowerCase();
    }
    if (record.title) {
      addToSearchHistory(record.title);
    }
    router.push({ pathname: '/record-detail', params: { payload } });
    animateClose();
  };

  const handleSearchCommit = (term: string) => {
    const trimmed = term.trim();
    if (trimmed) {
      if (historyTimerRef.current) {
        clearTimeout(historyTimerRef.current);
        historyTimerRef.current = null;
      }
      addToSearchHistory(trimmed);
      lastRecordedQueryRef.current = trimmed.toLowerCase();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={animateClose}
    >
      <View style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={animateClose}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </Pressable>

        <Animated.View
          style={[
            styles.drawer,
            {
              backgroundColor: palette.card,
              paddingTop: insets.top + Spacing.lg,
              transform: [{ translateY: drawerTranslate }],
            },
          ]}
        >
          <View style={styles.handle}>
            <View style={[styles.handleBar, { backgroundColor: palette.border }]} />
          </View>

          <Text style={[styles.title, { color: palette.text }]}>Search everything</Text>
          <Text style={[styles.subtitle, { color: palette.icon }]}>Filter transactions, categories, and more</Text>

          <View style={styles.headerRow}>
            <View style={[styles.searchFieldWrapper, { borderColor: palette.border, backgroundColor: '#FFFFFF' }]}>
              <MaterialCommunityIcons name="magnify" size={20} color={palette.icon} style={{ marginRight: 6 }} />
              <TextInput
                style={[styles.input, { color: palette.text }]}
                placeholder="Try “Lunch at Doppio”"
                placeholderTextColor={palette.icon}
                value={tempSearch}
                onChangeText={setTempSearch}
                onSubmitEditing={() => handleSearchCommit(tempSearch)}
                autoFocus
                returnKeyType="search"
              />
              {!!tempSearch && (
                <TouchableOpacity
                  style={styles.clearButtonInline}
                  onPress={handleClearSearch}
                  accessibilityLabel="Clear search"
                >
                  <MaterialCommunityIcons name="close" size={16} color={palette.icon} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TransactionTypeFilter
            value={filters.searchCategory}
            onChange={handleSelectCategory}
            variant="compact"
            style={styles.typeFilter}
          />

          {/* Live results replace recent searches */}
          <View style={styles.historyContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.historyTitle, { color: palette.text }]}>
                {tempSearch.trim().length === 0 ? 'Recent searches' : 'Results'}
              </Text>
              {loadingResults ? <MaterialCommunityIcons name="dots-horizontal" size={18} color={palette.icon} /> : null}
            </View>
            {tempSearch.trim().length === 0 ? (
                // Show recent searches when the field is empty
                filters.searchHistory.length > 0 ? (
                  <FlatList
                    data={filters.searchHistory}
                    keyExtractor={(item, idx) => `${item}-${idx}`}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[styles.historyItem, { borderColor: palette.border, backgroundColor: palette.surface }]}
                        onPress={() => handleSelectHistory(item)}
                      >
                        <View style={[styles.historyIcon, { backgroundColor: palette.background }]}>
                          <MaterialCommunityIcons name="history" size={16} color={palette.icon} />
                        </View>
                        <Text style={{ color: palette.text, flex: 1 }}>{item}</Text>
                        <MaterialCommunityIcons name="chevron-right" size={18} color={palette.icon} />
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <Text style={{ color: palette.icon }}>Start typing to see results</Text>
                )
              ) : results.length === 0 ? (
              <Text style={{ color: palette.icon }}>No results available for &ldquo;{tempSearch}&rdquo;</Text>
            ) : (
              <>
                <View style={styles.resultsListWrapper}>
                  <RecordList
                    records={displayResults}
                    variant="records"
                    onPressItem={(item) => openRecordDetail(item)}
                  />
                </View>
                {results.length > displayResults.length && (
                  <TouchableOpacity
                    onPress={() => {
                      handleSearchCommit(tempSearch);
                      router.push('/(tabs)/records');
                    }}
                    style={{ marginTop: Spacing.sm }}
                  >
                    <Text style={{ color: palette.tint, fontWeight: '600' }}>Show more</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    ...Shadows.modalSubtle,
  },
  input: {
    flex: 1,
    borderWidth: 0,
    paddingVertical: Spacing.md,
    paddingHorizontal: 0,
    textAlignVertical: 'center',
  },
  historyContainer: {
    marginTop: Spacing.xl,
  },
  historyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold as any,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  searchFieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  handle: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  handleBar: {
    width: 60,
    height: 5,
    borderRadius: BorderRadius.round,
    opacity: 0.7,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold as any,
  },
  subtitle: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  historyIcon: {
    width: 26,
    height: 26,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  resultsListWrapper: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingVertical: Spacing.sm,
  },
  primaryButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold as any,
  },
  typeFilter: {
    marginBottom: Spacing.xl,
  },
  clearButtonInline: {
    width: 26,
    height: 26,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
});