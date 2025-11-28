import { CATEGORY_MAP, CategoryKey, subcategoryList } from '@/constants/categories';
import { mockAccounts } from '@/constants/mock-data';
import { StorageService, type Transaction } from '@/services/storage';

const CATEGORY_AMOUNT_RANGES: Record<CategoryKey, { min: number; max: number }> = {
  foodAndDrinks: { min: 8, max: 120 },
  shopping: { min: 15, max: 650 },
  housing: { min: 80, max: 3200 },
  transportation: { min: 12, max: 450 },
  vehicle: { min: 25, max: 900 },
  lifeEntertainment: { min: 10, max: 500 },
  communicationPc: { min: 25, max: 220 },
  financialExpenses: { min: 60, max: 1500 },
  investments: { min: 150, max: 5000 },
  others: { min: 10, max: 400 },
  income: { min: 250, max: 7500 },
};

const PAYEE_SOURCES: Record<CategoryKey, string[]> = {
  foodAndDrinks: ['Whole Foods', 'Trader Joe\'s', 'Starbucks', 'Groceryland', 'Fresh Market'],
  shopping: ['Amazon', 'Best Buy', 'Target', 'Local Boutique', 'Pharmacy'],
  housing: ['Landlord', 'City Utilities', 'HydroOne', 'Property Manager'],
  transportation: ['Lyft', 'Uber', 'VIA Rail', 'Transit Authority'],
  vehicle: ['Shell', 'Esso', 'Tesla Supercharger', 'Canadian Tire Auto'],
  lifeEntertainment: ['Netflix', 'Regal Cinemas', 'Peloton', 'Museum'],
  communicationPc: ['Bell', 'Rogers', 'Telus', 'Shaw'],
  financialExpenses: ['CRA', 'Bank Fees', 'Financial Advisor'],
  investments: ['Questrade', 'Fidelity', 'Vanguard'],
  others: ['Miscellaneous Vendor'],
  income: ['Company X', 'Client Y', 'Government', 'Rental Tenant'],
};

const LABEL_POOL = ['recurring', 'family', 'personal', 'business', 'travel', 'subscription'];

const subcategoryNameSummary = (label: string) => {
  if (label.length <= 32) {
    return label;
  }
  return `${label.slice(0, 29)}...`;
};

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(randomBetween(min, max + 1));

const pickFrom = <T,>(values: readonly T[]): T => values[randomInt(0, values.length - 1)];

const randomDateWithin = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const formatTitle = (subcategoryName: string, type: Transaction['type']) => {
  if (type === 'income') {
    return `${subcategoryName} Income`;
  }
  return subcategoryName;
};

const maybeLabels = (): string[] | undefined => {
  if (Math.random() > 0.35) {
    return undefined;
  }
  const labelCount = randomInt(1, 2);
  const shuffled = [...LABEL_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, labelCount);
};

const pickAccount = (type: Transaction['type']) => {
  const filtered = mockAccounts.filter((account) => account.id !== 'all');
  if (type === 'income') {
    return filtered.find((account) => account.id === 'rbc') ?? filtered[0];
  }
  return pickFrom(filtered);
};

const amountForCategory = (categoryId: CategoryKey, type: Transaction['type']) => {
  const range = CATEGORY_AMOUNT_RANGES[categoryId] ?? { min: 20, max: 250 };
  const value = randomBetween(range.min, range.max);
  const rounded = Math.round(value * 100) / 100;
  return type === 'expense' ? -Math.abs(rounded) : Math.abs(rounded);
};

export const generateRealisticMockData = async () => {
  const now = new Date();
  const start = new Date(now);
  start.setFullYear(now.getFullYear() - 3);
  start.setMonth(0, 1);
  start.setHours(0, 0, 0, 0);

  const transactions: Transaction[] = [];
  const usage: Record<string, number> = {};

  subcategoryList.forEach((subcat, idx) => {
    const category = CATEGORY_MAP[subcat.parentId];
    const type = category?.type ?? 'expense';
    const yearlyBaseline = type === 'income' ? 4 : 12;
    const totalEntries = yearlyBaseline * 3 + randomInt(0, Math.max(2, yearlyBaseline));

    for (let i = 0; i < totalEntries; i += 1) {
      const date = randomDateWithin(start, now);
      const account = pickAccount(type);
      const amount = amountForCategory(subcat.parentId, type);
      const payee = pickFrom(PAYEE_SOURCES[subcat.parentId] ?? PAYEE_SOURCES.others);
      const labels = maybeLabels();

      transactions.push({
        id: `mock-${subcat.id}-${date.getTime()}-${i}-${idx}`,
        title: formatTitle(subcat.name, type),
        account: account.name,
        accountId: account.id,
        note: `${payee} · ${subcategoryNameSummary(subcat.name)}`,
        amount,
        date: date.toISOString(),
        type,
        icon: category?.icon ?? 'cash',
        categoryId: subcat.parentId,
        subcategoryId: subcat.id,
        labels,
        payee,
      });

      usage[subcat.id] = (usage[subcat.id] ?? 0) + 1;
    }
  });

  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  await StorageService.saveTransactions(transactions);
  await StorageService.setCategoryUsage(usage);

  return { count: transactions.length };
};

