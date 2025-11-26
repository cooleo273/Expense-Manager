import { type CategoryKey, type CategoryType } from '../constants/categories';

export const mockTransactions = [
  {
    id: 'salary-oct',
    title: 'Salary Deposit',
    account: 'RBC',
    note: 'Monthly · Company X',
    amount: 4500,
    dateLabel: 'Nov 01, 2025',
    type: 'income' as CategoryType,
    icon: 'briefcase-outline',
    categoryId: 'income' as CategoryKey,
    subcategoryId: 'income:wage-invoices',
  },
  {
    id: 'freelance-oct',
    title: 'Freelance Project',
    account: 'RBC',
    note: 'Landing page · Client Z',
    amount: 1200,
    dateLabel: 'Oct 28, 2025',
    type: 'income' as CategoryType,
    icon: 'handshake',
    categoryId: 'income' as CategoryKey,
    subcategoryId: 'income:wage-invoices',
  },
  {
    id: 'rent-oct',
    title: 'Rent Payment',
    account: 'RBC',
    note: 'Downtown loft · Landlord',
    amount: -1850,
    dateLabel: 'Oct 27, 2025',
    type: 'expense' as CategoryType,
    icon: 'home-city-outline',
    categoryId: 'housing' as CategoryKey,
    subcategoryId: 'housing:rent',
  },
  {
    id: 'groceries-oct',
    title: 'Groceries',
    account: 'RBC Credit Card',
    note: 'Weekly run · Whole Foods',
    amount: -145.32,
    dateLabel: 'Oct 25, 2025',
    type: 'expense' as CategoryType,
    icon: 'cart-outline',
    categoryId: 'foodAndDrinks' as CategoryKey,
    subcategoryId: 'foodAndDrinks:groceries',
  },
  {
    id: 'fuel-oct',
    title: 'Fuel',
    account: 'RBC Credit Card',
    note: 'Premium · Shell',
    amount: -62.8,
    dateLabel: 'Oct 24, 2025',
    type: 'expense' as CategoryType,
    icon: 'gas-station-outline',
    categoryId: 'vehicle' as CategoryKey,
    subcategoryId: 'vehicle:fuel',
  },
  {
    id: 'dining-oct',
    title: 'Dinner Out',
    account: 'RBC Credit Card',
    note: 'Italian · Casa M',
    amount: -82.4,
    dateLabel: 'Oct 22, 2025',
    type: 'expense' as CategoryType,
    icon: 'silverware-fork-knife',
    categoryId: 'foodAndDrinks' as CategoryKey,
    subcategoryId: 'foodAndDrinks:restaurant-fast-food',
  },
  {
    id: 'internet-oct',
    title: 'Internet Bill',
    account: 'RBC',
    note: 'Fiber · Bell',
    amount: -89.99,
    dateLabel: 'Oct 20, 2025',
    type: 'expense' as CategoryType,
    icon: 'wifi',
    categoryId: 'communicationPc' as CategoryKey,
    subcategoryId: 'communicationPc:internet',
  },
  {
    id: 'insurance-oct',
    title: 'Car Insurance',
    account: 'RBC',
    note: 'Quarterly · Aviva',
    amount: -315.5,
    dateLabel: 'Oct 18, 2025',
    type: 'expense' as CategoryType,
    icon: 'shield-car',
    categoryId: 'vehicle' as CategoryKey,
    subcategoryId: 'vehicle:vehicle-insurance',
  },
  {
    id: 'coffee-oct',
    title: 'Coffee',
    account: 'RBC Credit Card',
    note: 'Latte · Pilot',
    amount: -6.5,
    dateLabel: 'Oct 17, 2025',
    type: 'expense' as CategoryType,
    icon: 'coffee-outline',
    categoryId: 'foodAndDrinks' as CategoryKey,
    subcategoryId: 'foodAndDrinks:bar-cafe',
  },
  {
    id: 'bonus-q3',
    title: 'Performance Bonus',
    account: 'RBC',
    note: 'Quarterly · Company X',
    amount: 2100,
    dateLabel: 'Oct 12, 2025',
    type: 'income' as CategoryType,
    icon: 'gift-outline',
    categoryId: 'income' as CategoryKey,
    subcategoryId: 'income:gifts',
  },
  {
    id: 'subscription',
    title: 'Streaming Bundle',
    account: 'RBC Credit Card',
    note: 'Netflix + Spotify',
    amount: -29.98,
    dateLabel: 'Oct 10, 2025',
    type: 'expense' as CategoryType,
    icon: 'television-play',
    categoryId: 'lifeEntertainment' as CategoryKey,
    subcategoryId: 'lifeEntertainment:tv-streaming',
  },
];

export const mockRecordsData = [
  { id: 'rec-salary', title: 'Salary Deposit', subtitle: 'Income · Wage, invoices', account: 'RBC', accountId: 'rbc', amount: 4200, dateLabel: 'Nov 01', type: 'income' as CategoryType, date: new Date(2025, 10, 1), categoryId: 'income' as CategoryKey, subcategoryId: 'income:wage-invoices' },
  { id: 'rec-bonus', title: 'Quarterly Bonus', subtitle: 'Income · Gifts', account: 'RBC', accountId: 'rbc', amount: 1600, dateLabel: 'Oct 28', type: 'income' as CategoryType, date: new Date(2025, 9, 28), categoryId: 'income' as CategoryKey, subcategoryId: 'income:gifts' },
  { id: 'rec-groceries', title: 'Groceries Run', subtitle: 'Food & Drinks · Groceries', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -142.35, dateLabel: 'Oct 26', type: 'expense' as CategoryType, date: new Date(2025, 9, 26), categoryId: 'foodAndDrinks' as CategoryKey, subcategoryId: 'foodAndDrinks:groceries' },
  { id: 'rec-rent', title: 'Rent Payment', subtitle: 'Housing · Rent', account: 'RBC', accountId: 'rbc', amount: -1850, dateLabel: 'Oct 25', type: 'expense' as CategoryType, date: new Date(2025, 9, 25), categoryId: 'housing' as CategoryKey, subcategoryId: 'housing:rent' },
  { id: 'rec-coffee', title: 'Morning Coffee', subtitle: 'Food & Drinks · Bar, Cafe', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -6.5, dateLabel: 'Oct 24', type: 'expense' as CategoryType, date: new Date(2025, 9, 24), categoryId: 'foodAndDrinks' as CategoryKey, subcategoryId: 'foodAndDrinks:bar-cafe' },
  { id: 'rec-fuel', title: 'Fuel Stop', subtitle: 'Vehicle · Fuel', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -58.2, dateLabel: 'Oct 23', type: 'expense' as CategoryType, date: new Date(2025, 9, 23), categoryId: 'vehicle' as CategoryKey, subcategoryId: 'vehicle:fuel' },
  { id: 'rec-internet', title: 'Internet Bill', subtitle: 'Communication, PC · Internet', account: 'RBC', accountId: 'rbc', amount: -89.99, dateLabel: 'Oct 22', type: 'expense' as CategoryType, date: new Date(2025, 9, 22), categoryId: 'communicationPc' as CategoryKey, subcategoryId: 'communicationPc:internet' },
  { id: 'rec-dining', title: 'Dinner Date', subtitle: 'Food & Drinks · Restaurant, Fast-food', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -84.75, dateLabel: 'Oct 21', type: 'expense' as CategoryType, date: new Date(2025, 9, 21), categoryId: 'foodAndDrinks' as CategoryKey, subcategoryId: 'foodAndDrinks:restaurant-fast-food' },
  { id: 'rec-insurance', title: 'Auto Insurance', subtitle: 'Vehicle · Vehicle insurance', account: 'RBC', accountId: 'rbc', amount: -320, dateLabel: 'Oct 20', type: 'expense' as CategoryType, date: new Date(2025, 9, 20), categoryId: 'vehicle' as CategoryKey, subcategoryId: 'vehicle:vehicle-insurance' },
  { id: 'rec-freelance', title: 'Freelance Invoice', subtitle: 'Income · Wage, invoices', account: 'RBC', accountId: 'rbc', amount: 900, dateLabel: 'Oct 18', type: 'income' as CategoryType, date: new Date(2025, 9, 18), categoryId: 'income' as CategoryKey, subcategoryId: 'income:wage-invoices' },
  { id: 'rec-travel', title: 'Weekend Trip', subtitle: 'Transportation · Long distance', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -320.45, dateLabel: 'Oct 16', type: 'expense' as CategoryType, date: new Date(2025, 9, 16), categoryId: 'transportation' as CategoryKey, subcategoryId: 'transportation:long-distance' },
  { id: 'rec-streaming', title: 'Streaming Bundle', subtitle: 'Life & Entertainment · TV, Streaming', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -29.98, dateLabel: 'Oct 15', type: 'expense' as CategoryType, date: new Date(2025, 9, 15), categoryId: 'lifeEntertainment' as CategoryKey, subcategoryId: 'lifeEntertainment:tv-streaming' },
  { id: 'rec-utilities', title: 'Hydro Bill', subtitle: 'Housing · Energy, utilities', account: 'RBC', accountId: 'rbc', amount: -118.75, dateLabel: 'Oct 13', type: 'expense' as CategoryType, date: new Date(2025, 9, 13), categoryId: 'housing' as CategoryKey, subcategoryId: 'housing:energy-utilities' },
  { id: 'rec-gym', title: 'Gym Membership', subtitle: 'Life & Entertainment · Active sport, fitness', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -55, dateLabel: 'Oct 12', type: 'expense' as CategoryType, date: new Date(2025, 9, 12), categoryId: 'lifeEntertainment' as CategoryKey, subcategoryId: 'lifeEntertainment:active-sport-fitness' },
  { id: 'rec-pharmacy', title: 'Pharmacy Run', subtitle: 'Shopping · Drug-store, chemist', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -32.45, dateLabel: 'Oct 11', type: 'expense' as CategoryType, date: new Date(2025, 9, 11), categoryId: 'shopping' as CategoryKey, subcategoryId: 'shopping:drug-store-chemist' },
  { id: 'rec-dividend', title: 'Dividend Payout', subtitle: 'Income · Interests, dividends', account: 'RBC', accountId: 'rbc', amount: 210.25, dateLabel: 'Oct 09', type: 'income' as CategoryType, date: new Date(2025, 9, 9), categoryId: 'income' as CategoryKey, subcategoryId: 'income:interests-dividends' },
  { id: 'rec-coach', title: 'Coaching Session', subtitle: 'Life & Entertainment · Wellness, beauty', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -125, dateLabel: 'Oct 07', type: 'expense' as CategoryType, date: new Date(2025, 9, 7), categoryId: 'lifeEntertainment' as CategoryKey, subcategoryId: 'lifeEntertainment:wellness-beauty' },
  { id: 'rec-lunch', title: 'Team Lunch', subtitle: 'Food & Drinks · Restaurant, Fast-food', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -48.3, dateLabel: 'Oct 05', type: 'expense' as CategoryType, date: new Date(2025, 9, 5), categoryId: 'foodAndDrinks' as CategoryKey, subcategoryId: 'foodAndDrinks:restaurant-fast-food' },
  { id: 'rec-movie', title: 'Movie Night', subtitle: 'Life & Entertainment · Culture, sport events', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -34.99, dateLabel: 'Oct 03', type: 'expense' as CategoryType, date: new Date(2025, 9, 3), categoryId: 'lifeEntertainment' as CategoryKey, subcategoryId: 'lifeEntertainment:culture-sport-events' },
  { id: 'rec-water', title: 'Water & Waste', subtitle: 'Housing · Services', account: 'RBC', accountId: 'rbc', amount: -96.2, dateLabel: 'Oct 01', type: 'expense' as CategoryType, date: new Date(2025, 9, 1), categoryId: 'housing' as CategoryKey, subcategoryId: 'housing:services' },
];

export const mockBudgetCategories = [
  { id: 'shopping', label: 'Shopping', spent: 7000, limit: 20000 },
  { id: 'foodAndDrinks', label: 'Food & Drinks', spent: 5200, limit: 12000 },
  { id: 'lifeEntertainment', label: 'Life & Entertainment', spent: 1800, limit: 6000 },
  { id: 'communicationPc', label: 'Communication, PC', spent: 1400, limit: 3000 },
];

export const mockInitialReminders = [
  { id: '1', title: 'Monthly Rent', amount: 25000, schedule: 'Repeats monthly · 05 Mar 10:00' },
  { id: '2', title: 'Netflix Subscription', amount: 649, schedule: 'Repeats monthly · 08 Mar 11:00' },
  { id: '3', title: 'Amazon Prime', amount: 1499, schedule: 'Repeats yearly · 20 Apr 13:30' },
];

export type MockAccount = {
  id: string;
  name: string;
  subtitle: string;
  accent: string;
  icon: string;
};

export const mockAccounts: MockAccount[] = [
  { id: 'all', name: 'All Accounts', subtitle: '', accent: '#818CF8', icon: 'wallet-outline' },
  { id: 'rbc', name: 'RBC', subtitle: '', accent: '#2563EB', icon: 'bank-outline' },
  { id: 'rbc-credit', name: 'RBC Credit Card', subtitle: '', accent: '#F97316', icon: 'credit-card-chip-outline' },
];

const ACCOUNT_ID_SET = new Set(mockAccounts.map((account) => account.id));

export const resolveAccountId = (accountId?: string, accountName?: string): string => {
  if (accountId && ACCOUNT_ID_SET.has(accountId)) {
    return accountId;
  }
  if (accountName?.toLowerCase().includes('credit')) {
    return 'rbc-credit';
  }
  if (accountId === 'all') {
    return 'all';
  }
  return 'rbc';
};

export const getAccountMeta = (accountId?: string) =>
  mockAccounts.find((account) => account.id === accountId);

export const mockTransactionsList = [
  { id: 't1', title: 'Groceries · RBC Credit Card', subtitle: 'Food & Drinks', amount: -142.35, date: 'Oct 26, 2025' },
  { id: 't2', title: 'Salary · RBC', subtitle: 'Income', amount: 4200, date: 'Oct 25, 2025' },
  { id: 't3', title: 'Dining · RBC Credit Card', subtitle: 'Food & Drinks', amount: -84.75, date: 'Oct 21, 2025' },
  { id: 't4', title: 'Internet · RBC', subtitle: 'Communication, PC', amount: -89.99, date: 'Oct 22, 2025' },
  { id: 't5', title: 'Bonus · RBC', subtitle: 'Income', amount: 1600, date: 'Oct 28, 2025' },
  { id: 't6', title: 'Fuel · RBC Credit Card', subtitle: 'Vehicle', amount: -58.2, date: 'Oct 23, 2025' },
];

export const mockWeeklyAmounts: Record<'expense' | 'income', number[]> = {
  expense: [95, 120, 60, 85, 190, 70, 45],
  income: [210, 160, 120, 140, 260, 180, 140],
};

