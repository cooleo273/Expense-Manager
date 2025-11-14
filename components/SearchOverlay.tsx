import { TransactionTypeFilter } from '@/components/TransactionTypeFilter';
import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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

  const handleSearch = () => {
    setSearchTerm(tempSearch);
    if (tempSearch.trim()) {
      addToSearchHistory(tempSearch);
    }
    animateClose();
  };

  const handleSelectHistory = (term: string) => {
    setTempSearch(term);
    setSearchTerm(term);
    animateClose();
  };

  const handleSelectCategory = (category: 'all' | 'income' | 'expense') => {
    setSearchCategory(category);
  };

  const handleClearSearch = () => {
    setTempSearch('');
    setSearchTerm('');
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
                onSubmitEditing={handleSearch}
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

          {filters.searchHistory.length > 0 && (
            <View style={styles.historyContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.historyTitle, { color: palette.text }]}>Recent searches</Text>
                <MaterialCommunityIcons name="history" size={18} color={palette.icon} />
              </View>
              <FlatList
                data={filters.searchHistory}
                keyExtractor={(item, index) => index.toString()}
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
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: palette.tint }]}
            onPress={handleSearch}
          >
            <Text style={[styles.primaryButtonText, { color: palette.background }]}>Apply search</Text>
          </TouchableOpacity>
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