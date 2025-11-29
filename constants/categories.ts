import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import i18n from '../services/i18n';
import { CATEGORY_MAP as CATEGORY_MAP_FR, SUBCATEGORY_SETS as SUBCATEGORY_SETS_FR } from './categories-fr';

export type CategoryType = 'income' | 'expense';

export type CategoryKey =
  | 'foodAndDrinks'
  | 'shopping'
  | 'housing'
  | 'transportation'
  | 'vehicle'
  | 'lifeEntertainment'
  | 'communicationPc'
  | 'financialExpenses'
  | 'investments'
  | 'others'
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
  foodAndDrinks: {
    id: 'foodAndDrinks',
    name: 'Food & Drinks',
    color: '#F97316',
    icon: 'silverware-fork-knife',
    type: 'expense',
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    color: '#A855F7',
    icon: 'shopping',
    type: 'expense',
  },
  housing: {
    id: 'housing',
    name: 'Housing',
    color: '#EF4444',
    icon: 'home-variant-outline',
    type: 'expense',
  },
  transportation: {
    id: 'transportation',
    name: 'Transportation',
    color: '#0EA5E9',
    icon: 'bus',
    type: 'expense',
  },
  vehicle: {
    id: 'vehicle',
    name: 'Vehicle',
    color: '#22C55E',
    icon: 'car',
    type: 'expense',
  },
  lifeEntertainment: {
    id: 'lifeEntertainment',
    name: 'Life & Entertainment',
    color: '#EC4899',
    icon: 'party-popper',
    type: 'expense',
  },
  communicationPc: {
    id: 'communicationPc',
    name: 'Communication, PC',
    color: '#6366F1',
    icon: 'cellphone',
    type: 'expense',
  },
  financialExpenses: {
    id: 'financialExpenses',
    name: 'Financial Expenses',
    color: '#F59E0B',
    icon: 'bank-outline',
    type: 'expense',
  },
  investments: {
    id: 'investments',
    name: 'Investments',
    color: '#10B981',
    icon: 'chart-line',
    type: 'expense',
  },
  others: {
    id: 'others',
    name: 'Others',
    color: '#9CA3AF',
    icon: 'dots-horizontal-circle',
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
  foodAndDrinks: [
    { id: 'foodAndDrinks:bar-cafe', parentId: 'foodAndDrinks', name: 'Bar, Cafe', icon: 'coffee-outline' },
    { id: 'foodAndDrinks:groceries', parentId: 'foodAndDrinks', name: 'Groceries', icon: 'cart-outline' },
    { id: 'foodAndDrinks:restaurant-fast-food', parentId: 'foodAndDrinks', name: 'Restaurant, Fast-food', icon: 'silverware-fork-knife' },
  ],
  shopping: [
    { id: 'shopping:clothes-shoes', parentId: 'shopping', name: 'Clothes & shoes', icon: 'tshirt-crew-outline' },
    { id: 'shopping:drug-store-chemist', parentId: 'shopping', name: 'Drug-store, chemist', icon: 'pill' },
    { id: 'shopping:electronics-accessories', parentId: 'shopping', name: 'Electronics, accessories', icon: 'cellphone' },
    { id: 'shopping:free-time', parentId: 'shopping', name: 'Free-time', icon: 'puzzle-outline' },
    { id: 'shopping:gifts-joy', parentId: 'shopping', name: 'Gifts, joy', icon: 'gift-outline' },
    { id: 'shopping:health-beauty', parentId: 'shopping', name: 'Health and beauty', icon: 'flower-outline' },
    { id: 'shopping:home-green', parentId: 'shopping', name: 'Home, green', icon: 'leaf' },
    { id: 'shopping:jewels-accessories', parentId: 'shopping', name: 'Jewels, accessories', icon: 'diamond-stone' },
    { id: 'shopping:kids', parentId: 'shopping', name: 'Kids', icon: 'baby-face-outline' },
    { id: 'shopping:pets-animals', parentId: 'shopping', name: 'Pets, animals', icon: 'paw' },
    { id: 'shopping:stationary-tools', parentId: 'shopping', name: 'Stationary, tools', icon: 'pencil-ruler' },
  ],
  housing: [
    { id: 'housing:energy-utilities', parentId: 'housing', name: 'Energy, utilities', icon: 'flash-outline' },
    { id: 'housing:maintenance-repairs', parentId: 'housing', name: 'Maintenance, repairs', icon: 'hammer-wrench' },
    { id: 'housing:mortgage', parentId: 'housing', name: 'Mortgage', icon: 'office-building-outline' },
    { id: 'housing:property-insurance', parentId: 'housing', name: 'Property insurance', icon: 'shield-home-outline' },
    { id: 'housing:rent', parentId: 'housing', name: 'Rent', icon: 'home-city-outline' },
    { id: 'housing:services', parentId: 'housing', name: 'Services', icon: 'toolbox-outline' },
  ],
  transportation: [
    { id: 'transportation:business-trips', parentId: 'transportation', name: 'Business trips', icon: 'briefcase-outline' },
    { id: 'transportation:long-distance', parentId: 'transportation', name: 'Long distance', icon: 'airplane' },
    { id: 'transportation:public-transport', parentId: 'transportation', name: 'Public transport', icon: 'bus' },
    { id: 'transportation:taxi', parentId: 'transportation', name: 'Taxi', icon: 'taxi' },
  ],
  vehicle: [
    { id: 'vehicle:fuel', parentId: 'vehicle', name: 'Fuel', icon: 'gas-station-outline' },
    { id: 'vehicle:leasing', parentId: 'vehicle', name: 'Leasing', icon: 'car-key' },
    { id: 'vehicle:parking', parentId: 'vehicle', name: 'Parking', icon: 'parking' },
    { id: 'vehicle:rentals', parentId: 'vehicle', name: 'Rentals', icon: 'car-arrow-right' },
    { id: 'vehicle:vehicle-insurance', parentId: 'vehicle', name: 'Vehicle insurance', icon: 'shield-car' },
    { id: 'vehicle:vehicle-maintenance', parentId: 'vehicle', name: 'Vehicle maintenance', icon: 'car-wrench' },
  ],
  lifeEntertainment: [
    { id: 'lifeEntertainment:active-sport-fitness', parentId: 'lifeEntertainment', name: 'Active sport, fitness', icon: 'dumbbell' },
    { id: 'lifeEntertainment:alcohol-tobacco', parentId: 'lifeEntertainment', name: 'Alcohol, tobacco', icon: 'glass-cocktail' },
    { id: 'lifeEntertainment:books-audio-subscriptions', parentId: 'lifeEntertainment', name: 'Books, audio, subscriptions', icon: 'book-open-page-variant' },
    { id: 'lifeEntertainment:charity-gifts', parentId: 'lifeEntertainment', name: 'Charity, gifts', icon: 'hand-heart-outline' },
    { id: 'lifeEntertainment:culture-sport-events', parentId: 'lifeEntertainment', name: 'Culture, sport events', icon: 'ticket-confirmation-outline' },
    { id: 'lifeEntertainment:education-development', parentId: 'lifeEntertainment', name: 'Education, development', icon: 'school-outline' },
    { id: 'lifeEntertainment:health-care-doctor', parentId: 'lifeEntertainment', name: 'Health care, doctor', icon: 'stethoscope' },
    { id: 'lifeEntertainment:hobbies', parentId: 'lifeEntertainment', name: 'Hobbies', icon: 'palette-outline' },
    { id: 'lifeEntertainment:holiday-trips-hotels', parentId: 'lifeEntertainment', name: 'Holiday, trips, hotels', icon: 'beach' },
    { id: 'lifeEntertainment:life-events', parentId: 'lifeEntertainment', name: 'Life events', icon: 'party-popper' },
    { id: 'lifeEntertainment:lottery-gambling', parentId: 'lifeEntertainment', name: 'Lottery, gambling', icon: 'dice-5' },
    { id: 'lifeEntertainment:tv-streaming', parentId: 'lifeEntertainment', name: 'TV, Streaming', icon: 'television-play' },
    { id: 'lifeEntertainment:wellness-beauty', parentId: 'lifeEntertainment', name: 'Wellness, beauty', icon: 'flower' },
  ],
  communicationPc: [
    { id: 'communicationPc:internet', parentId: 'communicationPc', name: 'Internet', icon: 'wifi' },
    { id: 'communicationPc:phone-cellphone', parentId: 'communicationPc', name: 'Phone, cellphone', icon: 'cellphone' },
    { id: 'communicationPc:postal-services', parentId: 'communicationPc', name: 'Postal services', icon: 'email-outline' },
    { id: 'communicationPc:software-apps-games', parentId: 'communicationPc', name: 'Software, apps, games', icon: 'controller-classic-outline' },
  ],
  financialExpenses: [
    { id: 'financialExpenses:advisory', parentId: 'financialExpenses', name: 'Advisory', icon: 'account-tie-outline' },
    { id: 'financialExpenses:charges-fees', parentId: 'financialExpenses', name: 'Charges, Fees', icon: 'cash-multiple' },
    // { id: 'financialExpenses:child-support', parentId: 'financialExpenses', name: 'Child Support', icon: 'human-child' },
    { id: 'financialExpenses:fines', parentId: 'financialExpenses', name: 'Fines', icon: 'gavel' },
    { id: 'financialExpenses:insurances', parentId: 'financialExpenses', name: 'Insurances', icon: 'shield-outline' },
    { id: 'financialExpenses:loan-interest', parentId: 'financialExpenses', name: 'Loan, Interest', icon: 'cash-plus' },
    { id: 'financialExpenses:taxes', parentId: 'financialExpenses', name: 'Taxes', icon: 'file-document-outline' },
  ],
  investments: [
    { id: 'investments:collections', parentId: 'investments', name: 'Collections', icon: 'cube-outline' },
    { id: 'investments:financial-investments', parentId: 'investments', name: 'Financial investments', icon: 'chart-line' },
    { id: 'investments:realty', parentId: 'investments', name: 'Realty', icon: 'home-modern' },
    { id: 'investments:savings', parentId: 'investments', name: 'Savings', icon: 'piggy-bank' },
    { id: 'investments:vehicle-chattels', parentId: 'investments', name: 'Vehicle, chattels', icon: 'garage' },
  ],
  others: [
    { id: 'others:missing', parentId: 'others', name: 'Uncategorized', icon: 'dots-horizontal-circle-outline' },
  ],
  income: [
    { id: 'income:checks-coupons', parentId: 'income', name: 'Checks, coupons', icon: 'ticket-percent' },
    { id: 'income:dues-grants', parentId: 'income', name: 'Dues & grants', icon: 'hand-coin-outline' },
    { id: 'income:gifts', parentId: 'income', name: 'Gifts', icon: 'gift-outline' },
    { id: 'income:interests-dividends', parentId: 'income', name: 'Interests, dividends', icon: 'chart-areaspline' },
    { id: 'income:lending-renting', parentId: 'income', name: 'Lending, renting', icon: 'handshake' },
    { id: 'income:lottery-gambling', parentId: 'income', name: 'Lottery, Gambling', icon: 'dice-5' },
    { id: 'income:refunds', parentId: 'income', name: 'Refunds (tax, purchase)', icon: 'cash-refund' },
    { id: 'income:rental-income', parentId: 'income', name: 'Rental Income', icon: 'home-city-outline' },
    { id: 'income:sale', parentId: 'income', name: 'Sale', icon: 'tag-outline' },
    { id: 'income:wage-invoices', parentId: 'income', name: 'Wage, invoices', icon: 'briefcase-outline' },
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
  const isFrench = i18n.language === 'fr';
  if (!id) {
    return undefined;
  }
  const subcategory = getSubcategoryDefinition(id);
  if (subcategory) {
    if (isFrench) {
      const frenchSubcategory = SUBCATEGORY_SETS_FR[subcategory.parentId]?.find((s: SubcategoryDefinition) => s.id === subcategory.id);
      return frenchSubcategory?.name ?? subcategory.name;
    }
    return subcategory.name;
  }
  const category = getCategoryDefinition(id);
  if (category) {
    if (isFrench) {
      return CATEGORY_MAP_FR[category.id]?.name ?? category.name;
    }
    return category.name;
  }
  return undefined;
}

export function getFullCategoryLabel(categoryId: string | undefined, subcategoryId?: string | null): string {
  const isFrench = i18n.language === 'fr';
  const subcategory = getSubcategoryDefinition(subcategoryId || undefined);
  if (subcategory) {
    if (isFrench) {
      const frenchSubcategory = SUBCATEGORY_SETS_FR[subcategory.parentId]?.find((s: SubcategoryDefinition) => s.id === subcategory.id);
      return frenchSubcategory?.name ?? subcategory.name;
    }
    return subcategory.name;
  }
  const category = getCategoryDefinition(categoryId);
  if (category) {
    if (isFrench) {
      return CATEGORY_MAP_FR[category.id]?.name ?? category.name;
    }
    return category.name;
  }
  return categoryId ?? '';
}

export function getCategoryDefinition(id: CategoryKey | string | undefined): CategoryDefinition | undefined {
  const isFrench = i18n.language === 'fr';
  if (!id) {
    return undefined;
  }
  const category = (isFrench ? CATEGORY_MAP_FR : CATEGORY_MAP)[id as CategoryKey];
  if (category) {
    return category;
  }
  const subcategory = getSubcategoryDefinition(id);
  if (subcategory) {
    return (isFrench ? CATEGORY_MAP_FR : CATEGORY_MAP)[subcategory.parentId];
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
