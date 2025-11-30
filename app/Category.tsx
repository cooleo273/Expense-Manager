import { ThemedText } from '@/components/themed-text';
import { getCategoryColor, getCategoryDefinition, getCategoryIcon, getCategoryList, getSubcategories, getSubcategoryDefinition, isSubcategoryId, type CategoryKey } from '@/constants/categories';
import { mockRecordsData } from '@/constants/mock-data';
import { Colors, Spacing } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StorageService } from '@/services/storage';
import { transactionDraftState } from '@/state/transactionDraftState';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function CategoriesScreen() {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const { filters, setTempSelectedCategories } = useFilterContext();


  const from = params.from as string || '';
  const paramCategory = params.current as string | undefined;
  const typeParam = (params.type as string) as 'income' | 'expense' | undefined;


  const currentCategory = paramCategory && paramCategory.length > 0
    ? paramCategory
    : (['log-expenses', 'log-expenses-list', 'filter'].includes(from) ? transactionDraftState.getLastSelectedCategory(typeParam ?? 'expense') : '');
 
  const autoOpenSubcategories = params.autoOpenSubcategories === '1';
  const batchIndex = params.batchIndex as string || '';
  const returnTo = params.returnTo as string || 'log-expenses';
  const recordIndex = params.recordIndex as string || '';
  const isFilterMode = from === 'filter';
  const currentSubcategory = params.subcategory as string || '';
  const [selectedIds, setSelectedIds] = useState<string[]>(filters.tempSelectedCategories);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [mostFrequent, setMostFrequent] = useState<string[]>([]);
  const localizedCategoryList = useMemo(() => getCategoryList(), [i18n.language]);

  const mostFrequentFiltered = useMemo(() => {
    if (!typeParam) return mostFrequent;
    return mostFrequent.filter(id => getCategoryDefinition(id)?.type === typeParam);
  }, [mostFrequent, typeParam]);


  const mostFrequentWithLastUsed = useMemo(() => {
    if (!typeParam) {
      return mostFrequentFiltered;
    }
    const ordered = [...mostFrequentFiltered];
    const lastSub = transactionDraftState.getLastSelectedSubcategory(typeParam);
    if (lastSub) {
      if (!ordered.includes(lastSub)) {
        ordered.unshift(lastSub);
      }
      return ordered;
    }
    const lastCategory = transactionDraftState.getLastSelectedCategory(typeParam);
    if (!lastCategory) {
      return ordered;
    }
    if (ordered.includes(lastCategory)) {
      return ordered;
    }
    ordered.unshift(lastCategory);
    return ordered;
  }, [mostFrequentFiltered, typeParam]);


  const toUniqueIds = useCallback((ids: string[]): string[] => {
    const seen = new Set<string>();
    const unique: string[] = [];
    ids.forEach((id) => {
      const def = getCategoryDefinition(id);
      if (!def) {
        return;
      }
      if (seen.has(id)) {
        return;
      }
      seen.add(id);
      unique.push(id);
    });
    return unique;
  }, []);

  useEffect(() => {
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
        const unique = toUniqueIds(sorted);
        if (mounted) setMostFrequent(unique.slice(0, 5));
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [toUniqueIds]);


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
      return [...withoutChildren, categoryId, ...subIds];
    });
  };


  const toggleSubcategorySelection = (subcategoryId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(subcategoryId)) {
        const sub = getSubcategoryDefinition(subcategoryId);
        return prev.filter(id => id !== subcategoryId && id !== (sub ? sub.parentId : ''));
      }
      const sub = getSubcategoryDefinition(subcategoryId);
      if (!sub) {
        return prev;
      }
      const withoutParent = prev.filter(id => id !== sub.parentId);
      const newSelected = [...withoutParent, subcategoryId];
      const siblingIds = getSubcategories(sub.parentId).map(s => s.id);
      const allSiblingsSelected = siblingIds.every(id => newSelected.includes(id));
      if (allSiblingsSelected) {
        return [...new Set([...newSelected, sub.parentId])];
      }
      return newSelected;
    });
  };


  const navigateToSubcategories = async (categoryId: CategoryKey, selectedSubcategory?: string) => {
    const paramsToPass: Record<string, string> = {
      category: categoryId,
    };
    if (batchIndex) {
      paramsToPass.batchIndex = batchIndex;
    }
    if (selectedSubcategory) {
      paramsToPass.selected = selectedSubcategory;
    } else if (currentCategory === categoryId && currentSubcategory) {
      paramsToPass.selected = currentSubcategory;
    }
    if (returnTo) {
      paramsToPass.returnTo = returnTo;
    }
    if (recordIndex) {
      paramsToPass.recordIndex = recordIndex;
    }
    try {
      if (!selectedSubcategory) {
        await StorageService.incrementCategoryUsage(categoryId);
      }
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
      const unique = toUniqueIds(sorted);
      setMostFrequent(unique.slice(0, 5));
    } catch (err) {
      // ignore
    }


    router.push({ pathname: '/subcategories', params: paramsToPass });
  };


  useEffect(() => {
    if (!isFilterMode && autoOpenSubcategories && typeParam) {
      try {
        if (typeParam === 'income') {
          navigateToSubcategories('income');
        }
      } catch (err) {
      }
    }
  }, [autoOpenSubcategories, isFilterMode, typeParam]);


  const handleDone = () => {
    setTempSelectedCategories(selectedIds);
    router.back();
  };


  useEffect(() => {
    if (!isFilterMode) {
      return;
    }
    router.setParams?.({});
    return () => {
      (router as any)?.setOptions?.({ headerRight: undefined });
    };
  }, [isFilterMode, router]);

  const latestSelectedIds = useRef(selectedIds);

  useEffect(() => {
    latestSelectedIds.current = selectedIds;
  }, [selectedIds]);

  useEffect(() => {
    if (!isFilterMode) {
      return;
    }
    return () => {
      setTempSelectedCategories(latestSelectedIds.current);
    };
  }, [isFilterMode, setTempSelectedCategories]);


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.card }} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerRight: isFilterMode
            ? () => (
                <TouchableOpacity onPress={handleDone} style={{ paddingHorizontal: Spacing.md }}>
                  <MaterialCommunityIcons name="check" size={22} color={palette.tint} />
                </TouchableOpacity>
              )
            : undefined,
        }}
      />
      <View style={{ paddingVertical: Spacing.tiny, backgroundColor: palette.card, borderBottomWidth: 1, borderBottomColor: palette.border }}>
        <ThemedText style={{ color: palette.icon, fontSize: 12, fontWeight: '600', marginBottom: 8, marginHorizontal: Spacing.lg, padding: Spacing.tiny }}>{t('most_frequent')}</ThemedText>
        {mostFrequentWithLastUsed.length > 0 ? (
          <View style={{ backgroundColor: palette.card, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 0 }}
            >
            {mostFrequentWithLastUsed.map((id: string, index: number) => {
              const catDef = getCategoryDefinition(id);
              if (!catDef) return null;
              const subcategory = isSubcategoryId(id) ? getSubcategoryDefinition(id) : undefined;
              const parentId = subcategory ? subcategory.parentId : catDef.id;
              const categoryColor = getCategoryColor(parentId, palette.tint);
              const iconName = getCategoryIcon(subcategory ? subcategory.id : parentId);
              const label = subcategory ? subcategory.name : catDef.name;
              const isLast = index === mostFrequentWithLastUsed.length - 1;
                return (
                  <TouchableOpacity
                    key={id}
                    onPress={() => navigateToSubcategories(parentId, subcategory?.id)}
                    style={{
                      alignItems: 'center',
                      backgroundColor: palette.card,
                      paddingVertical: Spacing.sm,
                      paddingHorizontal: Spacing.sm,
                      borderRadius: 12,
                      marginRight: isLast ? 0 : Spacing.sm,
                      width: 110,
                    }}
                  >
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${categoryColor}20`, alignItems: 'center', justifyContent: 'center' }}>
                      <MaterialCommunityIcons name={iconName as any} size={16} color={categoryColor} />
                    </View>
                    <ThemedText style={{ color: palette.text, marginTop: 6, textAlign: 'center', fontSize: 12 }} numberOfLines={2}>
                      {label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <ThemedText style={{ color: palette.icon }}>{t('no_categories_selected')}</ThemedText>
        )}
      </View>


      <FlatList
        ListHeaderComponent={() => (
          <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, backgroundColor: palette.surface, borderBottomWidth: 1, borderBottomColor: palette.border }}>
            <ThemedText style={{ color: palette.icon, fontSize: 12, fontWeight: '600', padding: Spacing.tiny }}>{t('all_categories')}</ThemedText>
          </View>
        )}
        data={typeParam ? localizedCategoryList.filter(c => c.type === typeParam) : localizedCategoryList}
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
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 18 }}>
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
                      size={24}
                      color={palette.icon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => toggleCategorySelection(item.id)} style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
                    <MaterialCommunityIcons
                      name={isCategorySelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={28}
                      // Show selected state with app accent (blue) — not the category color
                      color={isCategorySelected ? palette.tint : palette.icon}
                    />
                  </TouchableOpacity>
                </View>
                {isExpanded && (
                  <View style={{ paddingLeft: 68, paddingRight: 16, paddingBottom: 12, gap: 8 }}>
                    {subcategories.map((sub) => {
                      const isSubSelected = selectedIds.includes(sub.id);
                      return (
                        <TouchableOpacity
                          key={sub.id}
                          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}
                          onPress={() => toggleSubcategorySelection(sub.id)}
                        >
                          <ThemedText style={{ color: palette.text }}>{sub.name}</ThemedText>
                          <MaterialCommunityIcons
                            name={isSubSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                            size={24}
                            color={isSubSelected ? palette.tint : palette.icon}
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
