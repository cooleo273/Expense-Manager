import {
    ExpenseLineItem,
    ExpenseTax,
    MindeeField,
    ReceiptDraftPatch,
    ReceiptFields,
    ReceiptImportResult,
    ReceiptLineItemField,
    ReceiptTaxField,
} from '@/types/receipt';

const isMindeeField = <T>(value: unknown): value is MindeeField<T> =>
  Boolean(value) && typeof value === 'object' && ('value' in (value as Record<string, unknown>) || 'raw_value' in (value as Record<string, unknown>));

const extractFieldValue = <T>(input?: MindeeField<T> | T | null): T | undefined => {
  if (input === null || input === undefined) {
    return undefined;
  }
  if (isMindeeField<T>(input)) {
    if (input.value !== undefined && input.value !== null) {
      return input.value as T;
    }
    if (input.raw_value !== undefined && input.raw_value !== null) {
      return input.raw_value as T;
    }
    return undefined;
  }
  return input as T;
};

const toCleanString = (value?: MindeeField<string> | string | number | null): string | undefined => {
  const raw = extractFieldValue<string | number>(value as MindeeField<string> | string | number | null);
  if (raw === undefined || raw === null) {
    return undefined;
  }
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw.toString() : undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const toNumber = (value?: MindeeField<number> | MindeeField<string> | number | string | null): number | undefined => {
  const raw = extractFieldValue<number | string>(value as MindeeField<number> | string | number | null);
  if (raw === undefined || raw === null) {
    return undefined;
  }
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : undefined;
  }
  if (typeof raw === 'string') {
    const normalized = Number(raw.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(normalized) ? normalized : undefined;
  }
  return undefined;
};

const pickFirstString = (candidates: Array<string | number | MindeeField<string> | MindeeField<number> | null | undefined>): string | undefined => {
  for (const candidate of candidates) {
    const value = toCleanString(candidate as MindeeField<string> | string | number | null);
    if (value) {
      return value;
    }
  }
  return undefined;
};

const pickFirstNumber = (candidates: Array<MindeeField<number> | MindeeField<string> | number | string | null | undefined>): number | undefined => {
  for (const candidate of candidates) {
    const numeric = toNumber(candidate as MindeeField<number> | number | string | null);
    if (numeric !== undefined) {
      return numeric;
    }
  }
  return undefined;
};

const buildLineItems = (items?: ReceiptLineItemField[]): ExpenseLineItem[] => {
  if (!items?.length) {
    return [];
  }
  return items
    .map((item) => {
      const description = toCleanString(item.description ?? null) ?? '';
      const quantity = toNumber(item.quantity ?? null) ?? 1;
      const unitPrice = toNumber(item.unit_price ?? null) ?? 0;
      const total =
        toNumber(item.total_price ?? null) ??
        toNumber(item.total_amount ?? null) ??
        (quantity * unitPrice || 0);

      return {
        description,
        quantity,
        unitPrice,
        total,
      };
    })
    .filter((item) => item.description.length > 0 || item.total > 0);
};

const buildTaxes = (taxes?: ReceiptTaxField[]): ExpenseTax[] => {
  if (!taxes?.length) {
    return [];
  }
  return taxes
    .map((tax) => {
      const rate = toNumber(tax.rate ?? null) ?? 0;
      const base = toNumber(tax.base ?? null) ?? 0;
      const amount = toNumber(tax.amount ?? null) ?? 0;
      return { rate, base, amount };
    })
    .filter((tax) => tax.rate > 0 || tax.base > 0 || tax.amount > 0);
};

const formatAmountString = (value: number): string => {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2);
};

export const mapReceiptToExpense = (fields?: ReceiptFields | null): ReceiptImportResult | null => {
  if (!fields) {
    return null;
  }

  const merchant = pickFirstString([fields.supplier_name, fields.merchant_name, fields.vendor]) ?? '';
  const description = pickFirstString([fields.purchase_description, fields.description, merchant]) ?? '';
  const category = pickFirstString([fields.purchase_category]) ?? '';
  const subcategory = pickFirstString([fields.purchase_subcategory]) ?? '';
  const amountValue = pickFirstNumber([fields.total_amount, fields.amount, fields.tip]);
  const taxValue = pickFirstNumber([fields.total_tax]);
  const date = pickFirstString([fields.date]) ?? null;
  const time = pickFirstString([fields.time]) ?? null;

  const draftPatch: ReceiptDraftPatch = {};
  if (amountValue !== undefined) {
    draftPatch.amount = formatAmountString(amountValue);
  }
  if (merchant) {
    draftPatch.payee = merchant;
  }
  if (description) {
    draftPatch.note = description;
  }
  if (category) {
    draftPatch.category = category;
  }
  if (subcategory) {
    draftPatch.subcategoryId = subcategory;
  }

  const items = buildLineItems(fields.line_items);
  const taxes = buildTaxes(fields.taxes);

  return {
    draftPatch,
    expense: {
      amount: draftPatch.amount ?? '',
      payee: draftPatch.payee ?? '',
      note: draftPatch.note ?? '',
      category: draftPatch.category ?? '',
      subcategoryId: draftPatch.subcategoryId ?? '',
      merchant,
      total: amountValue ?? null,
      tax: taxValue ?? null,
      date,
      time,
      items,
      taxes,
    },
  };
};
