import { TransactionTypeFilter } from '@/components/TransactionTypeFilter';
import { getNodeDisplayName } from '@/constants/categories';
import { getAccountMeta } from '@/constants/mock-data';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StorageService } from '@/services/storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

type SearchOverlayProps = {
  visible: boolean;
  onClose: () => void;
};

const DRAWER_MAX_HEIGHT = Math.min(Dimensions.get('window').height * 0.85, 640);

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const { filters, setSearchTerm, addToSearchHistory, setSearchCategory } = useFilterContext();
  const [tempSearch, setTempSearch] = useState(filters.searchTerm);
  const [results, setResults] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const router = useRouter();
  const displayResults = results.slice(0, 5);
  const insets = useSafeAreaInsets();
  const drawerTranslate = useRef(new Animated.Value(-DRAWER_MAX_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const isClosingRef = useRef(false);

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
    let canceled = false;
    const doSearch = async () => {
      setLoadingResults(true);
      try {
        const txns = await StorageService.getTransactions();
        const query = tempSearch.trim().toLowerCase();
        const queryTokens = query.split(/\s+/).filter(Boolean);
        const filtered = txns.filter((t: any) => {
          if (filters.searchCategory && filters.searchCategory !== 'all' && t.type !== filters.searchCategory) {
            return false;
          }
          if (!query) {
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
          return queryTokens.every(matchesToken);
        });
        if (!canceled) setResults(filtered);
      } catch (err) {
        console.error('Search failed', err);
        if (!canceled) setResults([]);
      } finally {
        if (!canceled) setLoadingResults(false);
      }
    };

    const timer = setTimeout(doSearch, 200);
    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [tempSearch, filters.searchCategory]);

  const handleSelectHistory = (term: string) => {
    setTempSearch(term);
    setSearchTerm(term);
  };

  const handleSelectCategory = (category: 'all' | 'income' | 'expense') => {
    setSearchCategory(category);
  };

  const handleClearSearch = () => {
    setTempSearch('');
    setSearchTerm('');
  };

  const openRecordDetail = (record: any) => {
    const payload = encodeURIComponent(JSON.stringify(record));
    router.push({ pathname: '/record-detail', params: { payload } });
    animateClose();
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
            <View style={[styles.searchFieldWrapper, { borderColor: palette.border, backgroundColor: palette.surface }]}>
              <MaterialCommunityIcons name="magnify" size={20} color={palette.icon} style={{ marginRight: 6 }} />
              <TextInput
                style={[styles.input, { color: palette.text }]}
                placeholder="Try “Lunch at Doppio”"
                placeholderTextColor={palette.icon}
                value={tempSearch}
                onChangeText={setTempSearch}
                // Do not set the shared searchTerm on enter — keep the overlay results local.
                // Still add it to recent history so users can find it later.
                onSubmitEditing={() => {
                  if (tempSearch.trim()) addToSearchHistory(tempSearch);
                }}
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
                          <MaterialCommunityIcons name="magnify" size={16} color={palette.icon} />
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
              <Text style={{ color: palette.icon }}>No results available for "{tempSearch}"</Text>
            ) : (
              <>
                <FlatList
                  data={displayResults}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.historyItem, { borderColor: palette.border, backgroundColor: palette.surface }]}
                    onPress={() => openRecordDetail(item)}
                  >
                    <View style={[styles.historyIcon, { backgroundColor: palette.background }]}>
                      <MaterialCommunityIcons name="file-document" size={16} color={palette.icon} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: palette.text, fontWeight: '600' }}>
                        {getNodeDisplayName(item.subcategoryId) ?? getNodeDisplayName(item.categoryId) ?? item.title}
                      </Text>
                      <Text style={{ color: palette.icon, fontSize: 12 }}>{getAccountMeta(item.accountId)?.name ?? item.account}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={18} color={palette.icon} />
                  </TouchableOpacity>
                )}
                />
                {results.length > 5 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchTerm(tempSearch);
                  if (tempSearch.trim()) addToSearchHistory(tempSearch);
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