import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCategoryColor, getCategoryDefinition, getCategoryIcon, getSubcategories, type CategoryKey } from '@/constants/categories';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SubcategoriesScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();

  const categoryId = params.category as CategoryKey;
  const batchId = params.batchId as string || '';
  const selectedSubcategory = params.selected as string || '';

  const category = getCategoryDefinition(categoryId);
  const subcategories = getSubcategories(categoryId);
  const categoryColor = getCategoryColor(categoryId, palette.tint);
  const iconName = getCategoryIcon(categoryId);

  const handleSubcategorySelect = (subcategoryId: string) => {
    const paramsToPass: Record<string, string> = {
      category: categoryId,
      subcategory: subcategoryId,
    };
    if (batchId) {
      paramsToPass.batchId = batchId;
    }
    router.push({ pathname: '/log-expenses', params: paramsToPass });
  };

  const handleGeneralSelect = () => {
    const paramsToPass: Record<string, string> = {
      category: categoryId,
    };
    if (batchId) {
      paramsToPass.batchId = batchId;
    }
    router.push({ pathname: '/log-expenses', params: paramsToPass });
  };

  if (!category) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.card }} edges={['top']}>
        <ThemedView style={{ padding: 16 }}>
          <ThemedText>Category not found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.card }} edges={['top']}>
      <ScrollView style={{ backgroundColor: palette.card }}>
        {/* General Section */}
        <View style={{ backgroundColor: `${palette.surface}80`, paddingVertical: 8, paddingHorizontal: 16, marginTop: 8 }}>
          <ThemedText style={{ color: palette.text, fontWeight: '600', fontSize: 14 }}>General</ThemedText>
        </View>
        <TouchableOpacity
          onPress={handleGeneralSelect}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: !selectedSubcategory ? `${categoryColor}20` : palette.card,
            borderBottomWidth: 1,
            borderBottomColor: palette.border,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: `${categoryColor}20`,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <MaterialCommunityIcons name={iconName as any} size={16} color={categoryColor} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={{ color: palette.text, fontWeight: '600' }}>{category.name}</ThemedText>
          </View>
          {!selectedSubcategory && <MaterialCommunityIcons name="check" size={20} color={categoryColor} />}
        </TouchableOpacity>

        {/* SubCategory Section */}
        <View style={{ backgroundColor: `${palette.surface}60`, paddingVertical: 8, paddingHorizontal: 16, marginTop: 16 }}>
          <ThemedText style={{ color: palette.text, fontWeight: '600', fontSize: 14 }}>SubCategory</ThemedText>
        </View>
        {subcategories.map((sub) => {
          const isSelected = sub.id === selectedSubcategory;
          const subIcon = getCategoryIcon(sub.id);

          return (
            <TouchableOpacity
              key={sub.id}
              onPress={() => handleSubcategorySelect(sub.id)}
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
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: `${categoryColor}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <MaterialCommunityIcons name={subIcon as any} size={16} color={categoryColor} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ color: palette.text, fontWeight: '600' }}>{sub.name}</ThemedText>
              </View>
              {isSelected && <MaterialCommunityIcons name="check" size={20} color={categoryColor} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}