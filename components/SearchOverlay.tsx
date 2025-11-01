import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SearchOverlayProps = {
  visible: boolean;
  onClose: () => void;
};

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const { filters, setSearchTerm, addToSearchHistory, setSearchCategory } = useFilterContext();
  const [tempSearch, setTempSearch] = useState(filters.searchTerm);
  const insets = useSafeAreaInsets();

  const filterChips = useMemo(
    () => [
      { label: 'Expense', value: 'expense' as const, icon: 'arrow-down-bold-circle' },
      { label: 'Income', value: 'income' as const, icon: 'arrow-up-bold-circle' },
      { label: 'All', value: 'all' as const, icon: 'format-list-bulleted' },
    ],
    []
  );

  useEffect(() => {
    if (visible) {
      setTempSearch(filters.searchTerm);
    }
  }, [filters.searchTerm, visible]);

  const handleSearch = () => {
    setSearchTerm(tempSearch);
    if (tempSearch.trim()) {
      addToSearchHistory(tempSearch);
    }
    onClose();
  };

  const handleSelectHistory = (term: string) => {
    setTempSearch(term);
    setSearchTerm(term);
    onClose();
  };

  const handleSelectCategory = (category: 'all' | 'income' | 'expense') => {
    setSearchCategory(category);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[StyleSheet.absoluteFill, { pointerEvents: 'box-none' }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <View style={styles.backdrop} />
        </Pressable>
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: palette.card,
              marginTop: insets.top + 16,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={[styles.searchFieldWrapper, { borderColor: palette.border, backgroundColor: palette.surface }]}>
              <MaterialCommunityIcons name="magnify" size={20} color={palette.icon} style={{ marginRight: 6 }} />
              <TextInput
                style={[styles.input, { color: palette.text }]}
                placeholder="Enter keyword"
                placeholderTextColor={palette.icon}
                value={tempSearch}
                onChangeText={setTempSearch}
                onSubmitEditing={handleSearch}
                autoFocus
              />
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} color={palette.icon} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterChipRow}>
            {filterChips.map(chip => {
              const isActive = filters.searchCategory === chip.value;
              return (
                <TouchableOpacity
                  key={chip.value}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isActive ? palette.tint : palette.surface,
                      borderColor: isActive ? palette.tint : palette.border,
                    },
                  ]}
                  onPress={() => handleSelectCategory(chip.value)}
                >
                  <MaterialCommunityIcons
                    name={chip.icon as any}
                    size={16}
                    color={isActive ? palette.background : palette.icon}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ color: isActive ? palette.background : palette.text }}>{chip.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {filters.searchHistory.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={[styles.historyTitle, { color: palette.text }]}>Recent Searches</Text>
              <FlatList
                data={filters.searchHistory}
                keyExtractor={(item, index) => index.toString()}
                style={styles.historyList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.historyItem, { borderBottomColor: palette.border }]}
                    onPress={() => handleSelectHistory(item)}
                  >
                    <MaterialCommunityIcons
                      name="history"
                      size={16}
                      color={palette.icon}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{ color: palette.text }}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  searchContainer: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadows.modalSubtle,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  searchButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  historyContainer: {
    marginTop: Spacing.xl,
    maxHeight: 220,
  },
  historyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold as any,
    marginBottom: Spacing.md,
  },
  historyList: {
    maxHeight: 220,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
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
  closeButton: {
    marginLeft: Spacing.md,
    width: 38,
    height: 38,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(233,236,239,0.6)',
  },
  filterChipRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
});