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

export function getCategoryDefinition(id: CategoryKey | string | undefined): CategoryDefinition | undefined {
  if (!id) {
    return undefined;
  }
  return CATEGORY_MAP[id as CategoryKey];
}

export function getCategoryColor(id: CategoryKey | string | undefined, fallback: string = '#4B5563'): string {
  return getCategoryDefinition(id)?.color ?? fallback;
}

export function getCategoryIcon(id: CategoryKey | string | undefined, fallback: MaterialIconName = 'shape-outline'): MaterialIconName {
  return getCategoryDefinition(id)?.icon ?? fallback;
}

export function getCategoryType(id: CategoryKey | string | undefined, fallback: CategoryType = 'expense'): CategoryType {
  return getCategoryDefinition(id)?.type ?? fallback;
}
