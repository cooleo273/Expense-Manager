import type { ComponentProps } from 'react';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export type CategoryType = 'income' | 'expense';

export type CategoryKey =
  | 'housing'
  | 'transportation'
  | 'groceries'
  | 'dining'
  | 'insurance'
  | 'health'
  | 'entertainment'
  | 'utilities'
  | 'income';

type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type CategoryDefinition = {
  id: CategoryKey;
  name: string;
  color: string;
  icon: MaterialIconName;
  type: CategoryType;
};

export type SubcategoryDefinition = {
  id: string;
  parentId: CategoryKey;
  name: string;
  icon: MaterialIconName;
};

export const CATEGORY_MAP: Record<CategoryKey, CategoryDefinition> = {
  housing: {
    id: 'housing',
    name: 'Housing',
    color: '#F97316',
    icon: 'home-variant-outline',
    type: 'expense',
  },
  transportation: {
    id: 'transportation',
    name: 'Transportation',
    color: '#0EA5E9',
    icon: 'car',
    type: 'expense',
  },
  groceries: {
    id: 'groceries',
    name: 'Groceries',
    color: '#22C55E',
    icon: 'basket-outline',
    type: 'expense',
  },
  dining: {
    id: 'dining',
    name: 'Dining',
    color: '#A855F7',
    icon: 'silverware-fork-knife',
    type: 'expense',
  },
  insurance: {
    id: 'insurance',
    name: 'Insurance',
    color: '#F59E0B',
    icon: 'shield-check-outline',
    type: 'expense',
  },
  health: {
    id: 'health',
    name: 'Health & Fitness',
    color: '#14B8A6',
    icon: 'heart-pulse',
    type: 'expense',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    color: '#EC4899',
    icon: 'movie-open-outline',
    type: 'expense',
  },
  utilities: {
    id: 'utilities',
    name: 'Utilities',
    color: '#4F46E5',
    icon: 'flash-outline',
    type: 'expense',
  },
  income: {
    id: 'income',
    name: 'Income',
    color: '#2563EB',
    icon: 'wallet-plus',
    type: 'income',
  },
};

export const categoryList: CategoryDefinition[] = Object.values(CATEGORY_MAP);

const SUBCATEGORY_SETS: Record<CategoryKey, SubcategoryDefinition[]> = {
  housing: [
    { id: 'housing:rent', parentId: 'housing', name: 'Rent', icon: 'home-city-outline' },
    { id: 'housing:mortgage', parentId: 'housing', name: 'Mortgage', icon: 'office-building-outline' },
  { id: 'housing:maintenance', parentId: 'housing', name: 'Maintenance', icon: 'wrench-outline' },
  { id: 'housing:taxes', parentId: 'housing', name: 'Property Tax', icon: 'file-document-outline' },
    { id: 'housing:hoa', parentId: 'housing', name: 'HOA Fees', icon: 'account-group-outline' },
  ],
  transportation: [
    { id: 'transportation:fuel', parentId: 'transportation', name: 'Fuel', icon: 'gas-station-outline' },
    { id: 'transportation:public', parentId: 'transportation', name: 'Public Transit', icon: 'bus' },
    { id: 'transportation:rideshare', parentId: 'transportation', name: 'Ride Share', icon: 'car-arrow-right' },
    { id: 'transportation:maintenance', parentId: 'transportation', name: 'Maintenance', icon: 'car-wrench' },
    { id: 'transportation:parking', parentId: 'transportation', name: 'Parking', icon: 'parking' },
  ],
  groceries: [
    { id: 'groceries:supermarket', parentId: 'groceries', name: 'Supermarket', icon: 'cart-outline' },
    { id: 'groceries:farmers', parentId: 'groceries', name: 'Farmers Market', icon: 'storefront-outline' },
    { id: 'groceries:pantry', parentId: 'groceries', name: 'Pantry Staples', icon: 'food-apple-outline' },
    { id: 'groceries:household', parentId: 'groceries', name: 'Household Supplies', icon: 'bottle-tonic-outline' },
    { id: 'groceries:beverages', parentId: 'groceries', name: 'Beverages', icon: 'cup-outline' },
  ],
  dining: [
    { id: 'dining:restaurant', parentId: 'dining', name: 'Restaurants', icon: 'silverware-fork-knife' },
    { id: 'dining:coffee', parentId: 'dining', name: 'Coffee Shops', icon: 'coffee-outline' },
    { id: 'dining:fast', parentId: 'dining', name: 'Fast Food', icon: 'food-outline' },
    { id: 'dining:delivery', parentId: 'dining', name: 'Delivery', icon: 'bike-fast' },
    { id: 'dining:bars', parentId: 'dining', name: 'Bars & Pubs', icon: 'glass-cocktail' },
  ],
  insurance: [
    { id: 'insurance:auto', parentId: 'insurance', name: 'Auto Insurance', icon: 'shield-car' },
    { id: 'insurance:home', parentId: 'insurance', name: 'Home Insurance', icon: 'shield-home-outline' },
    { id: 'insurance:health', parentId: 'insurance', name: 'Health Insurance', icon: 'hospital-box-outline' },
    { id: 'insurance:life', parentId: 'insurance', name: 'Life Insurance', icon: 'heart-outline' },
    { id: 'insurance:travel', parentId: 'insurance', name: 'Travel Insurance', icon: 'airplane' },
  ],
  health: [
    { id: 'health:gym', parentId: 'health', name: 'Gym & Fitness', icon: 'dumbbell' },
    { id: 'health:pharmacy', parentId: 'health', name: 'Pharmacy', icon: 'medical-bag' },
    { id: 'health:doctor', parentId: 'health', name: 'Doctor Visits', icon: 'stethoscope' },
    { id: 'health:dental', parentId: 'health', name: 'Dental Care', icon: 'tooth-outline' },
    { id: 'health:wellness', parentId: 'health', name: 'Wellness', icon: 'flower-outline' },
  ],
  entertainment: [
    { id: 'entertainment:movies', parentId: 'entertainment', name: 'Movies', icon: 'movie-outline' },
    { id: 'entertainment:concerts', parentId: 'entertainment', name: 'Concerts', icon: 'music-circle-outline' },
    { id: 'entertainment:gaming', parentId: 'entertainment', name: 'Gaming', icon: 'controller-classic-outline' },
    { id: 'entertainment:streaming', parentId: 'entertainment', name: 'Streaming', icon: 'cast' },
    { id: 'entertainment:events', parentId: 'entertainment', name: 'Events', icon: 'ticket-confirmation-outline' },
  ],
  utilities: [
    { id: 'utilities:electricity', parentId: 'utilities', name: 'Electricity', icon: 'flash-outline' },
    { id: 'utilities:water', parentId: 'utilities', name: 'Water', icon: 'water-outline' },
    { id: 'utilities:internet', parentId: 'utilities', name: 'Internet', icon: 'wifi' },
    { id: 'utilities:gas', parentId: 'utilities', name: 'Natural Gas', icon: 'fire' },
    { id: 'utilities:waste', parentId: 'utilities', name: 'Waste Services', icon: 'trash-can-outline' },
  ],
  income: [
    { id: 'income:salary', parentId: 'income', name: 'Salary', icon: 'briefcase-outline' },
    { id: 'income:bonus', parentId: 'income', name: 'Bonus', icon: 'gift-outline' },
    { id: 'income:freelance', parentId: 'income', name: 'Freelance', icon: 'laptop' },
    { id: 'income:investments', parentId: 'income', name: 'Investments', icon: 'chart-line' },
    { id: 'income:gifts', parentId: 'income', name: 'Gifts', icon: 'hand-heart-outline' },
  ],
};

type SubcategorySets = typeof SUBCATEGORY_SETS;
export type SubcategoryKey = SubcategorySets[keyof SubcategorySets][number]['id'];

const SUBCATEGORY_INDEX: Record<SubcategoryKey, SubcategoryDefinition> = Object.values(SUBCATEGORY_SETS).flat().reduce(
  (acc, item) => {
    acc[item.id as SubcategoryKey] = item;
    return acc;
  },
  {} as Record<SubcategoryKey, SubcategoryDefinition>
);

export const subcategoryList: SubcategoryDefinition[] = Object.values(SUBCATEGORY_INDEX);

export function getSubcategories(parentId: CategoryKey): SubcategoryDefinition[] {
  return SUBCATEGORY_SETS[parentId] ?? [];
}

export function getSubcategoryDefinition(id: string | undefined): SubcategoryDefinition | undefined {
  if (!id) {
    return undefined;
  }
  return SUBCATEGORY_INDEX[id];
}

export function isSubcategoryId(id: string | undefined): id is SubcategoryKey {
  return Boolean(getSubcategoryDefinition(id));
}

export function getNodeDisplayName(id: string | undefined): string | undefined {
  if (!id) {
    return undefined;
  }
  const subcategory = getSubcategoryDefinition(id);
  if (subcategory) {
    return subcategory.name;
  }
  return getCategoryDefinition(id)?.name;
}

export function getFullCategoryLabel(categoryId: string | undefined, subcategoryId?: string | null): string {
  const category = getCategoryDefinition(categoryId);
  if (!category) {
    return categoryId ?? '';
  }
  const subcategory = getSubcategoryDefinition(subcategoryId || undefined);
  if (!subcategory) {
    return category.name;
  }
  return `${category.name} - ${subcategory.name}`;
}

export function getCategoryDefinition(id: CategoryKey | string | undefined): CategoryDefinition | undefined {
  if (!id) {
    return undefined;
  }
  const category = CATEGORY_MAP[id as CategoryKey];
  if (category) {
    return category;
  }
  const subcategory = getSubcategoryDefinition(id);
  if (subcategory) {
    return CATEGORY_MAP[subcategory.parentId];
  }
  return undefined;
}

export function getCategoryColor(id: CategoryKey | string | undefined, fallback: string = '#4B5563'): string {
  const category = getCategoryDefinition(id);
  if (category) {
    return category.color;
  }
  const subcategory = getSubcategoryDefinition(id);
  if (subcategory) {
    return CATEGORY_MAP[subcategory.parentId].color;
  }
  return fallback;
}

export function getCategoryIcon(id: CategoryKey | string | undefined, fallback: MaterialIconName = 'shape-outline'): MaterialIconName {
  const subcategory = getSubcategoryDefinition(id);
  if (subcategory) {
    return subcategory.icon;
  }
  return getCategoryDefinition(id)?.icon ?? fallback;
}

export function getCategoryType(id: CategoryKey | string | undefined, fallback: CategoryType = 'expense'): CategoryType {
  return getCategoryDefinition(id)?.type ?? fallback;
}
