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
    subcategoryId: 'income:salary',
  },
  {
    id: 'freelance-oct',
    title: 'Freelance Project',
    account: 'RBC',
    note: 'Landing page · Client Z',
    amount: 1200,
    dateLabel: 'Oct 28, 2025',
    type: 'income' as CategoryType,
    icon: 'laptop',
    categoryId: 'income' as CategoryKey,
    subcategoryId: 'income:freelance',
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
    categoryId: 'groceries' as CategoryKey,
    subcategoryId: 'groceries:supermarket',
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
    categoryId: 'transportation' as CategoryKey,
    subcategoryId: 'transportation:fuel',
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
    categoryId: 'dining' as CategoryKey,
    subcategoryId: 'dining:restaurant',
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
    categoryId: 'utilities' as CategoryKey,
    subcategoryId: 'utilities:internet',
  },
  {
    id: 'insurance-oct',
    title: 'Car Insurance',
    account: 'RBC',
    note: 'Quarterly · Aviva',
    amount: -315.5,
    dateLabel: 'Oct 18, 2025',
    type: 'expense' as CategoryType,
    icon: 'shield-check-outline',
    categoryId: 'insurance' as CategoryKey,
    subcategoryId: 'insurance:auto',
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
    categoryId: 'dining' as CategoryKey,
    subcategoryId: 'dining:coffee',
  },
  {
    id: 'bonus-q3',
    title: 'Performance Bonus',
    account: 'RBC',
    note: 'Quarterly · Company X',
    amount: 2100,
    dateLabel: 'Oct 12, 2025',
    type: 'income' as CategoryType,
    icon: 'wallet-plus',
    categoryId: 'income' as CategoryKey,
    subcategoryId: 'income:bonus',
  },
  {
    id: 'subscription',
    title: 'Streaming Bundle',
    account: 'RBC Credit Card',
    note: 'Netflix + Spotify',
    amount: -29.98,
    dateLabel: 'Oct 10, 2025',
    type: 'expense' as CategoryType,
    icon: 'video-wireless-outline',
    categoryId: 'entertainment' as CategoryKey,
    subcategoryId: 'entertainment:streaming',
  },
];

export const mockRecordsData = [
  { id: 'rec-salary', title: 'Salary Deposit', subtitle: 'Income · Salary', account: 'RBC', accountId: 'rbc', amount: 4200, dateLabel: 'Nov 01', type: 'income' as CategoryType, date: new Date(2025, 10, 1), categoryId: 'income' as CategoryKey, subcategoryId: 'income:salary' },
  { id: 'rec-bonus', title: 'Quarterly Bonus', subtitle: 'Income · Bonus', account: 'RBC', accountId: 'rbc', amount: 1600, dateLabel: 'Oct 28', type: 'income' as CategoryType, date: new Date(2025, 9, 28), categoryId: 'income' as CategoryKey, subcategoryId: 'income:bonus' },
  { id: 'rec-groceries', title: 'Groceries Run', subtitle: 'Groceries · Supermarket', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -142.35, dateLabel: 'Oct 26', type: 'expense' as CategoryType, date: new Date(2025, 9, 26), categoryId: 'groceries' as CategoryKey, subcategoryId: 'groceries:supermarket' },
  { id: 'rec-rent', title: 'Rent Payment', subtitle: 'Housing · Rent', account: 'RBC', accountId: 'rbc', amount: -1850, dateLabel: 'Oct 25', type: 'expense' as CategoryType, date: new Date(2025, 9, 25), categoryId: 'housing' as CategoryKey, subcategoryId: 'housing:rent' },
  { id: 'rec-coffee', title: 'Morning Coffee', subtitle: 'Dining · Coffee', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -6.5, dateLabel: 'Oct 24', type: 'expense' as CategoryType, date: new Date(2025, 9, 24), categoryId: 'dining' as CategoryKey, subcategoryId: 'dining:coffee' },
  { id: 'rec-fuel', title: 'Fuel Stop', subtitle: 'Transportation · Fuel', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -58.2, dateLabel: 'Oct 23', type: 'expense' as CategoryType, date: new Date(2025, 9, 23), categoryId: 'transportation' as CategoryKey, subcategoryId: 'transportation:fuel' },
  { id: 'rec-internet', title: 'Internet Bill', subtitle: 'Utilities · Internet', account: 'RBC', accountId: 'rbc', amount: -89.99, dateLabel: 'Oct 22', type: 'expense' as CategoryType, date: new Date(2025, 9, 22), categoryId: 'utilities' as CategoryKey, subcategoryId: 'utilities:internet' },
  { id: 'rec-dining', title: 'Dinner Date', subtitle: 'Dining · Restaurant', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -84.75, dateLabel: 'Oct 21', type: 'expense' as CategoryType, date: new Date(2025, 9, 21), categoryId: 'dining' as CategoryKey, subcategoryId: 'dining:restaurant' },
  { id: 'rec-insurance', title: 'Auto Insurance', subtitle: 'Insurance · Auto', account: 'RBC', accountId: 'rbc', amount: -320, dateLabel: 'Oct 20', type: 'expense' as CategoryType, date: new Date(2025, 9, 20), categoryId: 'insurance' as CategoryKey, subcategoryId: 'insurance:auto' },
  { id: 'rec-freelance', title: 'Freelance Invoice', subtitle: 'Income · Freelance', account: 'RBC', accountId: 'rbc', amount: 900, dateLabel: 'Oct 18', type: 'income' as CategoryType, date: new Date(2025, 9, 18), categoryId: 'income' as CategoryKey, subcategoryId: 'income:freelance' },
  { id: 'rec-travel', title: 'Weekend Trip', subtitle: 'Transportation · Transit', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -320.45, dateLabel: 'Oct 16', type: 'expense' as CategoryType, date: new Date(2025, 9, 16), categoryId: 'transportation' as CategoryKey, subcategoryId: 'transportation:public' },
  { id: 'rec-streaming', title: 'Streaming Bundle', subtitle: 'Entertainment · Streaming', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -29.98, dateLabel: 'Oct 15', type: 'expense' as CategoryType, date: new Date(2025, 9, 15), categoryId: 'entertainment' as CategoryKey, subcategoryId: 'entertainment:streaming' },
  { id: 'rec-utilities', title: 'Hydro Bill', subtitle: 'Utilities · Electricity', account: 'RBC', accountId: 'rbc', amount: -118.75, dateLabel: 'Oct 13', type: 'expense' as CategoryType, date: new Date(2025, 9, 13), categoryId: 'utilities' as CategoryKey, subcategoryId: 'utilities:electricity' },
  { id: 'rec-gym', title: 'Gym Membership', subtitle: 'Health · Fitness', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -55, dateLabel: 'Oct 12', type: 'expense' as CategoryType, date: new Date(2025, 9, 12), categoryId: 'health' as CategoryKey, subcategoryId: 'health:gym' },
  { id: 'rec-pharmacy', title: 'Pharmacy Run', subtitle: 'Health · Pharmacy', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -32.45, dateLabel: 'Oct 11', type: 'expense' as CategoryType, date: new Date(2025, 9, 11), categoryId: 'health' as CategoryKey, subcategoryId: 'health:pharmacy' },
  { id: 'rec-dividend', title: 'Dividend Payout', subtitle: 'Income · Investments', account: 'RBC', accountId: 'rbc', amount: 210.25, dateLabel: 'Oct 09', type: 'income' as CategoryType, date: new Date(2025, 9, 9), categoryId: 'income' as CategoryKey, subcategoryId: 'income:investments' },
  { id: 'rec-coach', title: 'Coaching Session', subtitle: 'Health · Wellness', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -125, dateLabel: 'Oct 07', type: 'expense' as CategoryType, date: new Date(2025, 9, 7), categoryId: 'health' as CategoryKey, subcategoryId: 'health:wellness' },
  { id: 'rec-lunch', title: 'Team Lunch', subtitle: 'Dining · Casual', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -48.3, dateLabel: 'Oct 05', type: 'expense' as CategoryType, date: new Date(2025, 9, 5), categoryId: 'dining' as CategoryKey, subcategoryId: 'dining:fast' },
  { id: 'rec-movie', title: 'Movie Night', subtitle: 'Entertainment · Movies', account: 'RBC Credit Card', accountId: 'rbc-credit', amount: -34.99, dateLabel: 'Oct 03', type: 'expense' as CategoryType, date: new Date(2025, 9, 3), categoryId: 'entertainment' as CategoryKey, subcategoryId: 'entertainment:movies' },
  { id: 'rec-water', title: 'Water & Waste', subtitle: 'Utilities · Services', account: 'RBC', accountId: 'rbc', amount: -96.2, dateLabel: 'Oct 01', type: 'expense' as CategoryType, date: new Date(2025, 9, 1), categoryId: 'utilities' as CategoryKey, subcategoryId: 'utilities:waste' },
];

export const mockBudgetCategories = [
  { id: 'shopping', label: 'Shopping', spent: 7000, limit: 20000 },
  { id: 'groceries', label: 'Groceries', spent: 5200, limit: 12000 },
  { id: 'entertainment', label: 'Entertainment', spent: 1800, limit: 6000 },
  { id: 'subscriptions', label: 'Subscriptions', spent: 1400, limit: 3000 },
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
  { id: 't1', title: 'Groceries · RBC Credit Card', subtitle: 'Groceries', amount: -142.35, date: 'Oct 26, 2025' },
  { id: 't2', title: 'Salary · RBC', subtitle: 'Income', amount: 4200, date: 'Oct 25, 2025' },
  { id: 't3', title: 'Dining · RBC Credit Card', subtitle: 'Dining', amount: -84.75, date: 'Oct 21, 2025' },
  { id: 't4', title: 'Internet · RBC', subtitle: 'Utilities', amount: -89.99, date: 'Oct 22, 2025' },
  { id: 't5', title: 'Bonus · RBC', subtitle: 'Income', amount: 1600, date: 'Oct 28, 2025' },
  { id: 't6', title: 'Fuel · RBC Credit Card', subtitle: 'Transportation', amount: -58.2, date: 'Oct 23, 2025' },
];

export const mockWeeklyAmounts: Record<'expense' | 'income', number[]> = {
  expense: [95, 120, 60, 85, 190, 70, 45],
  income: [210, 160, 120, 140, 260, 180, 140],
};

