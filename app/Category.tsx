import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { categoryList, getCategoryColor, getCategoryIcon, getSubcategories, getSubcategoryDefinition, isSubcategoryId, type CategoryKey } from '@/constants/categories';
import { mockRecordsData } from '@/constants/mock-data';
import { Colors, Spacing } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StorageService } from '@/services/storage';

export default function CategoriesScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const { filters, setSelectedCategories } = useFilterContext();

  const currentCategory = params.current as string || '';
  const batchIndex = params.batchIndex as string || '';
  const from = params.from as string || '';
  const returnTo = params.returnTo as string || 'log-expenses';
  const recordIndex = params.recordIndex as string || '';

  const isFilterMode = from === 'filter';
  const currentSubcategory = params.subcategory as string || '';
  const [selectedIds, setSelectedIds] = useState<string[]>(filters.selectedCategories);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [mostFrequent, setMostFrequent] = useState<string[]>([]);

  // Load persisted category usage when the screen mounts so MOST FREQUENT can show
  // categories the user has recently used. If no persisted usage exists, seed
  // it from stored transactions (or mock data) so the user sees a sensible list.
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let usage = await StorageService.getCategoryUsage();
        if (!usage || Object.keys(usage).length === 0) {
          const txns = await StorageService.getTransactions();
          const source = txns.length > 0 ? txns : mockRecordsData;
          const counts: Record<string, number> = {};
          source.forEach((t: { categoryId?: string; subcategoryId?: string; category?: string }) => {
            const id = t.subcategoryId ?? t.categoryId ?? t.category;
            if (!id) return;
            counts[id] = (counts[id] ?? 0) + 1;
          });
          if (Object.keys(counts).length > 0) {
            await StorageService.setCategoryUsage(counts);
            usage = counts;
          }
        }
        const sorted = Object.entries(usage).sort((a, b) => b[1] - a[1]).map(([id]) => id);
        if (mounted) setMostFrequent(sorted.slice(0, 5));
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggleCategorySelection = (categoryId: CategoryKey) => {
    setSelectedIds(prev => {
      const subIds = getSubcategories(categoryId).map(sub => sub.id);
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId && !subIds.includes(id));
      }
      const withoutChildren = prev.filter(id => {
        if (!isSubcategoryId(id)) {
          return true;
        }
        const sub = getSubcategoryDefinition(id);
        return !sub || sub.parentId !== categoryId;
      });
      // When adding a parent category for filters, also select all its subcategories
      return [...withoutChildren, categoryId, ...subIds];
    });
  };

  const toggleSubcategorySelection = (subcategoryId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(subcategoryId)) {
        return prev.filter(id => id !== subcategoryId);
      }
      const sub = getSubcategoryDefinition(subcategoryId);
      if (!sub) {
        return prev;
      }
      // Add subcategory; if after adding all sibling subcategories are selected,
      // collapse selection to parent.
      const withoutParent = prev.filter(id => id !== sub.parentId);
      const newSelected = [...withoutParent, subcategoryId];
      const siblingIds = getSubcategories(sub.parentId).map(s => s.id);
      const allSiblingsSelected = siblingIds.every(id => newSelected.includes(id));
      if (allSiblingsSelected) {
        // if all subcategories selected, also add the parent but keep children checked
        return [...new Set([...newSelected, sub.parentId])];
      }
      return newSelected;
    });
  };

  const navigateToSubcategories = async (categoryId: CategoryKey) => {
    const paramsToPass: Record<string, string> = {
      category: categoryId,
    };
    if (batchIndex) {
      paramsToPass.batchIndex = batchIndex;
    }
    if (currentCategory === categoryId && currentSubcategory) {
      paramsToPass.selected = currentSubcategory;
    }
    if (returnTo) {
      paramsToPass.returnTo = returnTo;
    }
    if (recordIndex) {
      paramsToPass.recordIndex = recordIndex;
    }
    // Increment usage for most-frequent list (persist locally)
    try {
      await StorageService.incrementCategoryUsage(categoryId);
        let usage = await StorageService.getCategoryUsage();
        // try to read persisted usage. If none exists seed it from transactions
          if (!usage || Object.keys(usage).length === 0) {
            const txns = await StorageService.getTransactions();
            const source = txns.length > 0 ? txns : mockRecordsData;
            const counts: Record<string, number> = {};
            source.forEach((t: { categoryId?: string; subcategoryId?: string; category?: string }) => {
              const id = t.subcategoryId ?? t.categoryId ?? t.category;
              if (!id) return;
              counts[id] = (counts[id] ?? 0) + 1;
            });
            if (Object.keys(counts).length > 0) {
              await StorageService.setCategoryUsage(counts);
              usage = counts;
            }
          }
          const sorted = Object.entries(usage).sort((a, b) => b[1] - a[1]).map(([id]) => id);
          setMostFrequent(sorted.slice(0, 5));
    } catch (err) {
      // ignore
    }

    router.push({ pathname: '/subcategories', params: paramsToPass });
  };

  const handleDone = () => {
    setSelectedCategories(selectedIds);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.card }} edges={['top']}>
              {isFilterMode && (

      <ThemedView style={{ paddingHorizontal: Spacing.lg, paddingVertical: 0, backgroundColor: palette.card, borderBottomWidth: 1, borderBottomColor: palette.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={handleDone}>
            <ThemedText style={{ color: palette.tint, fontWeight: '600' }}>DONE</ThemedText>
          </TouchableOpacity>
        
      </ThemedView>
      )}
      <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.tiny, backgroundColor: palette.surface, borderBottomWidth: 1, borderBottomColor: palette.border }}>
        <ThemedText style={{ color: palette.icon, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>MOST FREQUENT</ThemedText>
        {mostFrequent.length > 0 ? (
          <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center' }}>
            {mostFrequent.map((id) => {
              const cat = categoryList.find((c) => c.id === id);
              if (!cat) return null;
              const categoryColor = getCategoryColor(cat.id, palette.tint);
              const iconName = getCategoryIcon(cat.id);
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => navigateToSubcategories(cat.id)}
                  style={{
                    alignItems: 'center',
                    backgroundColor: palette.card,
                    paddingVertical: Spacing.sm,
                    paddingHorizontal: Spacing.md,
                    borderRadius: 12,
                  }}
                >
                  <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: `${categoryColor}20`, alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons name={iconName as any} size={20} color={categoryColor} />
                  </View>
                  <ThemedText style={{ color: palette.text, marginTop: 8 }}>{cat.name}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <ThemedText style={{ color: palette.icon }}>No categories selected</ThemedText>
        )}
      </View>

      <FlatList
        ListHeaderComponent={() => (
          <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, backgroundColor: palette.surface, borderBottomWidth: 1, borderBottomColor: palette.border }}>
            <ThemedText style={{ color: palette.icon, fontSize: 12, fontWeight: '600' }}>ALL CATEGORIES</ThemedText>
          </View>
        )}
        data={categoryList}
        keyExtractor={(item) => item.id}
        style={{ backgroundColor: palette.card }}
        renderItem={({ item }) => {
          const categoryColor = getCategoryColor(item.id, palette.tint);
          const iconName = getCategoryIcon(item.id);

          if (isFilterMode) {
            const isExpanded = expandedCategory === item.id;
            const isCategorySelected = selectedIds.includes(item.id);
            const subcategories = getSubcategories(item.id);
            const selectedSubCount = subcategories.filter(sub => selectedIds.includes(sub.id)).length;

            return (
              <View key={item.id} style={{ borderBottomWidth: 1, borderBottomColor: palette.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                    onPress={() => setExpandedCategory(prev => (prev === item.id ? null : item.id))}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: `${categoryColor}20`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <MaterialCommunityIcons name={iconName as any} size={20} color={categoryColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={{ color: palette.text, fontWeight: '600' }}>{item.name}</ThemedText>
                      {selectedSubCount > 0 && (
                        <ThemedText style={{ color: palette.icon, fontSize: 12 }}>{selectedSubCount} subcategory{selectedSubCount > 1 ? ' items' : ' item'}</ThemedText>
                      )}
                    </View>
                    <MaterialCommunityIcons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={palette.icon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => toggleCategorySelection(item.id)} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
                    <MaterialCommunityIcons
                      name={isCategorySelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={22}
                      color={isCategorySelected ? categoryColor : palette.icon}
                    />
                  </TouchableOpacity>
                </View>
                {isExpanded && (
                  <View style={{ paddingLeft: 68, paddingRight: 16, paddingBottom: 12, gap: 8 }}>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                      onPress={() => toggleCategorySelection(item.id)}
                    >
                      <ThemedText style={{ color: palette.text }}>All {item.name}</ThemedText>
                      <MaterialCommunityIcons
                        name={isCategorySelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={20}
                        color={isCategorySelected ? categoryColor : palette.icon}
                      />
                    </TouchableOpacity>
                    {subcategories.map((sub) => {
                      const isSubSelected = selectedIds.includes(sub.id);
                      return (
                        <TouchableOpacity
                          key={sub.id}
                          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                          onPress={() => toggleSubcategorySelection(sub.id)}
                        >
                          <ThemedText style={{ color: palette.text }}>{sub.name}</ThemedText>
                          <MaterialCommunityIcons
                            name={isSubSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                            size={20}
                            color={isSubSelected ? categoryColor : palette.icon}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          }

          const isSelected = item.id === currentCategory;
          return (
            <TouchableOpacity
              onPress={() => navigateToSubcategories(item.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                backgroundColor: isSelected ? `${categoryColor}20` : palette.card,
                borderBottomWidth: 1,
                borderBottomColor: palette.border,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: `${categoryColor}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <MaterialCommunityIcons name={iconName as any} size={20} color={categoryColor} />
              </View>
                <View style={{ flex: 1 }}>
                <ThemedText style={{ color: palette.text, fontWeight: '600' }}>{item.name}</ThemedText>
              </View>
              {isSelected && <MaterialCommunityIcons name="check" size={20} color={categoryColor} />}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

export const options = {
  headerShown: false,
};