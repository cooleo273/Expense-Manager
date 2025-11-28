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

const CATEGORY_LABEL_OVERRIDES: Partial<Record<CategoryKey, string[]>> = {
  foodAndDrinks: ['dining-out', 'grocery-run', 'coffee'],
  shopping: ['essentials', 'wishlist'],
  housing: ['utilities', 'rent'],
  transportation: ['commute', 'rideshare'],
  vehicle: ['fuel', 'maintenance'],
  lifeEntertainment: ['wellness', 'social'],
  communicationPc: ['internet', 'phone'],
  financialExpenses: ['fees', 'insurance'],
  investments: ['portfolio', 'retirement'],
  income: ['salary', 'bonus'],
};

const NOTE_TEMPLATES: Partial<Record<CategoryKey, string[]>> = {
  foodAndDrinks: [
    'Meal at {payee}',
    'Groceries restock at {payee}',
    'Coffee run - {payee}',
  ],
  shopping: [
    'Picked up {subcategory} items',
    'Online order via {payee}',
  ],
  housing: [
    'Monthly {subcategory} payment',
    '{payee} invoice settled',
  ],
  transportation: [
    '{payee} ride across town',
    'Transit top-up',
  ],
  vehicle: [
    'Car expense at {payee}',
    'Fuel stop - {payee}',
  ],
  lifeEntertainment: [
    '{subcategory} outing',
    'Streaming/activities with {payee}',
  ],
  communicationPc: [
    '{payee} monthly bill',
    'Tech upgrade for {subcategory}',
  ],
  financialExpenses: ['Finance charge: {payee}', 'Policy update via {payee}'],
  investments: ['Investment move with {payee}', '{subcategory} contribution'],
  others: ['Misc expense noted', '{subcategory} catch-all item'],
  income: ['Deposit from {payee}', 'Recorded {subcategory} income'],
};

const FALLBACK_NOTE_TEMPLATES = [
  '{subcategory} entry with {payee}',
  '{subcategory} update',
  'Tracked {subcategory} (${amount})',
];

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

const maybeLabels = (categoryId: CategoryKey): string[] | undefined => {
  const pool = [...LABEL_POOL, ...(CATEGORY_LABEL_OVERRIDES[categoryId] ?? [])];
  if (pool.length === 0) {
    return undefined;
  }
  const shouldAssign = Math.random() < 0.65;
  if (!shouldAssign) {
    return undefined;
  }
  const labelCount = Math.min(pool.length, randomInt(1, 3));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = new Set<string>();
  for (const label of shuffled) {
    selected.add(label);
    if (selected.size >= labelCount) {
      break;
    }
  }
  return Array.from(selected);
};

const buildNote = (categoryId: CategoryKey, subcategoryName: string, payee: string, amount: number) => {
  const templates = NOTE_TEMPLATES[categoryId] ?? FALLBACK_NOTE_TEMPLATES;
  const template = pickFrom(templates);
  const summary = subcategoryNameSummary(subcategoryName);
  return template
    .replace(/\{subcategory\}/gi, summary)
    .replace(/\{payee\}/gi, payee)
    .replace(/\{amount\}/gi, Math.abs(amount).toFixed(2));
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
      const labels = maybeLabels(subcat.parentId);
      const note = buildNote(subcat.parentId, subcat.name, payee, amount);

      transactions.push({
        id: `mock-${subcat.id}-${date.getTime()}-${i}-${idx}`,
        title: formatTitle(subcat.name, type),
        account: account.name,
        accountId: account.id,
        note,
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

  const totals = transactions.reduce(
    (acc, tx) => {
      if (tx.type === 'income') {
        acc.income += tx.amount;
      } else {
        acc.expense += Math.abs(tx.amount);
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const desiredIncome = totals.expense * 0.95;
  let incomeShortfall = desiredIncome - totals.income;

  while (incomeShortfall > 0) {
    const amount = Math.min(Math.max(1800, incomeShortfall / 2), 6500);
    const salaryDate = randomDateWithin(start, now);
    const account = mockAccounts.find((acc) => acc.id === 'rbc') ?? mockAccounts[0];

    transactions.push({
      id: `mock-income-balance-${salaryDate.getTime()}-${incomeShortfall.toFixed(0)}`,
      title: 'Supplemental Income',
      account: account.name,
      accountId: account.id,
      note: buildNote('income', 'Supplemental Income', 'Company X', amount),
      amount,
      date: salaryDate.toISOString(),
      type: 'income',
      icon: CATEGORY_MAP.income.icon,
      categoryId: 'income',
      subcategoryId: 'income:wage-invoices',
      labels: ['recurring'],
      payee: 'Company X',
    });

    usage['income:wage-invoices'] = (usage['income:wage-invoices'] ?? 0) + 1;
    incomeShortfall -= amount;
  }

  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  await StorageService.saveTransactions(transactions);
  await StorageService.setCategoryUsage(usage);

  return { count: transactions.length };
};

