import type { ComponentProps } from 'react';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

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
    name: 'Nourriture et Boissons',
    color: '#F97316',
    icon: 'silverware-fork-knife',
    type: 'expense',
  },
  shopping: {
    id: 'shopping',
    name: 'Magasinage',
    color: '#A855F7',
    icon: 'shopping',
    type: 'expense',
  },
  housing: {
    id: 'housing',
    name: 'Logement',
    color: '#EF4444',
    icon: 'home-variant-outline',
    type: 'expense',
  },
  transportation: {
    id: 'transportation',
    name: 'Transport',
    color: '#0EA5E9',
    icon: 'bus',
    type: 'expense',
  },
  vehicle: {
    id: 'vehicle',
    name: 'Véhicule',
    color: '#22C55E',
    icon: 'car',
    type: 'expense',
  },
  lifeEntertainment: {
    id: 'lifeEntertainment',
    name: 'Vie et Divertissement',
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
    name: 'Dépenses Financières',
    color: '#F59E0B',
    icon: 'bank-outline',
    type: 'expense',
  },
  investments: {
    id: 'investments',
    name: 'Investissements',
    color: '#10B981',
    icon: 'chart-line',
    type: 'expense',
  },
  others: {
    id: 'others',
    name: 'Autres',
    color: '#9CA3AF',
    icon: 'dots-horizontal-circle',
    type: 'expense',
  },
  income: {
    id: 'income',
    name: 'Revenu',
    color: '#2563EB',
    icon: 'wallet-plus',
    type: 'income',
  },
};

export const categoryList: CategoryDefinition[] = Object.values(CATEGORY_MAP);

export const SUBCATEGORY_SETS: Record<CategoryKey, SubcategoryDefinition[]> = {
  foodAndDrinks: [
    { id: 'foodAndDrinks:bar-cafe', parentId: 'foodAndDrinks', name: 'Bar, Café', icon: 'coffee-outline' },
    { id: 'foodAndDrinks:groceries', parentId: 'foodAndDrinks', name: 'Épicerie', icon: 'cart-outline' },
    { id: 'foodAndDrinks:restaurant-fast-food', parentId: 'foodAndDrinks', name: 'Restaurant, Fast-food', icon: 'silverware-fork-knife' },
  ],
  shopping: [
    { id: 'shopping:clothes-shoes', parentId: 'shopping', name: 'Vêtements et chaussures', icon: 'tshirt-crew-outline' },
    { id: 'shopping:drug-store-chemist', parentId: 'shopping', name: 'Pharmacie, chimiste', icon: 'pill' },
    { id: 'shopping:electronics-accessories', parentId: 'shopping', name: 'Électronique, accessoires', icon: 'cellphone' },
    { id: 'shopping:free-time', parentId: 'shopping', name: 'Temps libre', icon: 'puzzle-outline' },
    { id: 'shopping:gifts-joy', parentId: 'shopping', name: 'Cadeaux, joie', icon: 'gift-outline' },
    { id: 'shopping:health-beauty', parentId: 'shopping', name: 'Santé et beauté', icon: 'flower-outline' },
    { id: 'shopping:home-green', parentId: 'shopping', name: 'Maison, vert', icon: 'leaf' },
    { id: 'shopping:jewels-accessories', parentId: 'shopping', name: 'Bijoux, accessoires', icon: 'diamond-stone' },
    { id: 'shopping:kids', parentId: 'shopping', name: 'Enfants', icon: 'baby-face-outline' },
    { id: 'shopping:pets-animals', parentId: 'shopping', name: 'Animaux de compagnie', icon: 'paw' },
    { id: 'shopping:stationary-tools', parentId: 'shopping', name: 'Papeterie, outils', icon: 'pencil-ruler' },
  ],
  housing: [
    { id: 'housing:energy-utilities', parentId: 'housing', name: 'Énergie, services publics', icon: 'flash-outline' },
    { id: 'housing:maintenance-repairs', parentId: 'housing', name: 'Entretien, réparations', icon: 'hammer-wrench' },
    { id: 'housing:mortgage', parentId: 'housing', name: 'Hypothèque', icon: 'office-building-outline' },
    { id: 'housing:property-insurance', parentId: 'housing', name: 'Assurance habitation', icon: 'shield-home-outline' },
    { id: 'housing:rent', parentId: 'housing', name: 'Loyer', icon: 'home-city-outline' },
    { id: 'housing:services', parentId: 'housing', name: 'Services', icon: 'toolbox-outline' },
  ],
  transportation: [
    { id: 'transportation:business-trips', parentId: 'transportation', name: 'Voyages d\'affaires', icon: 'briefcase-outline' },
    { id: 'transportation:long-distance', parentId: 'transportation', name: 'Longue distance', icon: 'airplane' },
    { id: 'transportation:public-transport', parentId: 'transportation', name: 'Transport public', icon: 'bus' },
    { id: 'transportation:taxi', parentId: 'transportation', name: 'Taxi', icon: 'taxi' },
  ],
  vehicle: [
    { id: 'vehicle:fuel', parentId: 'vehicle', name: 'Carburant', icon: 'gas-station-outline' },
    { id: 'vehicle:leasing', parentId: 'vehicle', name: 'Location', icon: 'car-key' },
    { id: 'vehicle:parking', parentId: 'vehicle', name: 'Stationnement', icon: 'parking' },
    { id: 'vehicle:rentals', parentId: 'vehicle', name: 'Locations', icon: 'car-arrow-right' },
    { id: 'vehicle:vehicle-insurance', parentId: 'vehicle', name: 'Assurance véhicule', icon: 'shield-car' },
    { id: 'vehicle:vehicle-maintenance', parentId: 'vehicle', name: 'Entretien du véhicule', icon: 'car-wrench' },
  ],
  lifeEntertainment: [
    { id: 'lifeEntertainment:active-sport-fitness', parentId: 'lifeEntertainment', name: 'Sport actif, fitness', icon: 'dumbbell' },
    { id: 'lifeEntertainment:alcohol-tobacco', parentId: 'lifeEntertainment', name: 'Alcool, tabac', icon: 'glass-cocktail' },
    { id: 'lifeEntertainment:books-audio-subscriptions', parentId: 'lifeEntertainment', name: 'Livres, audio, abonnements', icon: 'book-open-page-variant' },
    { id: 'lifeEntertainment:charity-gifts', parentId: 'lifeEntertainment', name: 'Charité, cadeaux', icon: 'hand-heart-outline' },
    { id: 'lifeEntertainment:culture-sport-events', parentId: 'lifeEntertainment', name: 'Culture, événements sportifs', icon: 'ticket-confirmation-outline' },
    { id: 'lifeEntertainment:education-development', parentId: 'lifeEntertainment', name: 'Éducation, développement', icon: 'school-outline' },
    { id: 'lifeEntertainment:health-care-doctor', parentId: 'lifeEntertainment', name: 'Soins de santé, médecin', icon: 'stethoscope' },
    { id: 'lifeEntertainment:hobbies', parentId: 'lifeEntertainment', name: 'Passe-temps', icon: 'palette-outline' },
    { id: 'lifeEntertainment:holiday-trips-hotels', parentId: 'lifeEntertainment', name: 'Vacances, voyages, hôtels', icon: 'beach' },
    { id: 'lifeEntertainment:life-events', parentId: 'lifeEntertainment', name: 'Événements de la vie', icon: 'party-popper' },
    { id: 'lifeEntertainment:lottery-gambling', parentId: 'lifeEntertainment', name: 'Loterie, jeux de hasard', icon: 'dice-5' },
    { id: 'lifeEntertainment:tv-streaming', parentId: 'lifeEntertainment', name: 'TV, Streaming', icon: 'television-play' },
    { id: 'lifeEntertainment:wellness-beauty', parentId: 'lifeEntertainment', name: 'Bien-être, beauté', icon: 'flower' },
  ],
  communicationPc: [
    { id: 'communicationPc:internet', parentId: 'communicationPc', name: 'Internet', icon: 'wifi' },
    { id: 'communicationPc:phone-cellphone', parentId: 'communicationPc', name: 'Téléphone, cellulaire', icon: 'cellphone' },
    { id: 'communicationPc:postal-services', parentId: 'communicationPc', name: 'Services postaux', icon: 'email-outline' },
    { id: 'communicationPc:software-apps-games', parentId: 'communicationPc', name: 'Logiciels, applications, jeux', icon: 'controller-classic-outline' },
  ],
  financialExpenses: [
    { id: 'financialExpenses:advisory', parentId: 'financialExpenses', name: 'Conseil', icon: 'account-tie-outline' },
    { id: 'financialExpenses:charges-fees', parentId: 'financialExpenses', name: 'Frais, honoraires', icon: 'cash-multiple' },
    // { id: 'financialExpenses:child-support', parentId: 'financialExpenses', name: 'Pension alimentaire', icon: 'human-child' },
    { id: 'financialExpenses:fines', parentId: 'financialExpenses', name: 'Amendes', icon: 'gavel' },
    { id: 'financialExpenses:insurances', parentId: 'financialExpenses', name: 'Assurances', icon: 'shield-outline' },
    { id: 'financialExpenses:loan-interest', parentId: 'financialExpenses', name: 'Prêt, Intérêt', icon: 'cash-plus' },
    { id: 'financialExpenses:taxes', parentId: 'financialExpenses', name: 'Impôts', icon: 'file-document-outline' },
  ],
  investments: [
    { id: 'investments:collections', parentId: 'investments', name: 'Collections', icon: 'cube-outline' },
    { id: 'investments:financial-investments', parentId: 'investments', name: 'Investissements financiers', icon: 'chart-line' },
    { id: 'investments:realty', parentId: 'investments', name: 'Immobilier', icon: 'home-modern' },
    { id: 'investments:savings', parentId: 'investments', name: 'Épargne', icon: 'piggy-bank' },
    { id: 'investments:vehicle-chattels', parentId: 'investments', name: 'Véhicule, biens mobiliers', icon: 'garage' },
  ],
  others: [
    { id: 'others:missing', parentId: 'others', name: 'Non catégorisé', icon: 'dots-horizontal-circle-outline' },
  ],
  income: [
    { id: 'income:checks-coupons', parentId: 'income', name: 'Chèques, coupons', icon: 'ticket-percent' },
    { id: 'income:dues-grants', parentId: 'income', name: 'Cotisations et subventions', icon: 'hand-coin-outline' },
    { id: 'income:gifts', parentId: 'income', name: 'Cadeaux', icon: 'gift-outline' },
    { id: 'income:interests-dividends', parentId: 'income', name: 'Intérêts, dividendes', icon: 'chart-areaspline' },
    { id: 'income:lending-renting', parentId: 'income', name: 'Prêt, location', icon: 'handshake' },
    { id: 'income:lottery-gambling', parentId: 'income', name: 'Loterie, Jeux de hasard', icon: 'dice-5' },
    { id: 'income:refunds', parentId: 'income', name: 'Remboursements (taxes, achats)', icon: 'cash-refund' },
    { id: 'income:rental-income', parentId: 'income', name: 'Revenus locatifs', icon: 'home-city-outline' },
    { id: 'income:sale', parentId: 'income', name: 'Vente', icon: 'tag-outline' },
    { id: 'income:wage-invoices', parentId: 'income', name: 'Salaire, factures', icon: 'briefcase-outline' },
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