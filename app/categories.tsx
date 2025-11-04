import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { categoryList, getCategoryColor, getCategoryIcon } from '@/constants/categories';
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
  const [selectedCategories, setSelectedCategoriesLocal] = useState<string[]>(filters.selectedCategories);

  const handleCategorySelect = (categoryId: string) => {
    if (isFilterMode) {
      setSelectedCategoriesLocal(prev => 
        prev.includes(categoryId) 
          ? prev.filter(id => id !== categoryId) 
          : [...prev, categoryId]
      );
    } else {
      router.push({
        pathname: '/log-expenses',
        params: { selectedCategory: categoryId, ...(batchId && { batchId }) }
      });
    }
  };

  const handleDone = () => {
    setSelectedCategories(selectedCategories);
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
          const isSelected = isFilterMode ? selectedCategories.includes(item.id) : item.id === currentCategory;
          const categoryColor = getCategoryColor(item.id, palette.tint);
          const iconName = getCategoryIcon(item.id);

          return (
            <TouchableOpacity
              onPress={() => handleCategorySelect(item.id)}
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
                <MaterialCommunityIcons
                  name={iconName as any}
                  size={20}
                  color={categoryColor}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ color: palette.text, fontWeight: '600' }}>{item.name}</ThemedText>
                <ThemedText style={{ color: palette.icon, fontSize: 12 }}>{item.type}</ThemedText>
              </View>
              {isSelected && (
                <MaterialCommunityIcons name={isFilterMode ? "checkbox-marked" : "check"} size={20} color={categoryColor} />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}