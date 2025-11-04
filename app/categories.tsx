import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { categoryList, getCategoryColor, getCategoryIcon, getSubcategories, getSubcategoryDefinition, isSubcategoryId, type CategoryKey } from '@/constants/categories';
import { Colors } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CategoriesScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const { filters, setSelectedCategories } = useFilterContext();

  const currentCategory = params.current as string || '';
  const batchId = params.batchId as string || '';
  const from = params.from as string || '';

  const isFilterMode = from === 'filter';
  const currentSubcategory = params.subcategory as string || '';
  const [selectedIds, setSelectedIds] = useState<string[]>(filters.selectedCategories);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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
      return [...withoutChildren, categoryId];
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
      const withoutParent = prev.filter(id => id !== sub.parentId);
      return [...withoutParent, subcategoryId];
    });
  };

  const navigateToSubcategories = (categoryId: CategoryKey) => {
    const paramsToPass: Record<string, string> = {
      category: categoryId,
    };
    if (batchId) {
      paramsToPass.batchId = batchId;
    }
    if (currentCategory === categoryId && currentSubcategory) {
      paramsToPass.selected = currentSubcategory;
    }
    router.push({ pathname: '/subcategories', params: paramsToPass });
  };

  const handleDone = () => {
    setSelectedCategories(selectedIds);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.card }} edges={['top']}>
      <ThemedView style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: palette.card, borderBottomWidth: 1, borderBottomColor: palette.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ThemedText type="subtitle" style={{ color: palette.text }}>{isFilterMode ? 'Select Categories' : 'Select Category'}</ThemedText>
        {isFilterMode && (
          <TouchableOpacity onPress={handleDone}>
            <ThemedText style={{ color: palette.tint, fontWeight: '600' }}>DONE</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
      <FlatList
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
                      <ThemedText style={{ color: palette.icon, fontSize: 12 }}>{item.type}</ThemedText>
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
                <ThemedText style={{ color: palette.icon, fontSize: 12 }}>{item.type}</ThemedText>
              </View>
              {isSelected && <MaterialCommunityIcons name="check" size={20} color={categoryColor} />}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}