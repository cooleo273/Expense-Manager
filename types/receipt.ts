import { SingleDraft } from './transactions';

export type MindeeField<T> = {
  value?: T | null;
  raw_value?: T | null;
  confidence?: number;
};

export type ReceiptLineItemField = {
  description?: MindeeField<string> | string | null;
  quantity?: MindeeField<number> | number | null;
  unit_price?: MindeeField<number> | number | null;
  total_amount?: MindeeField<number> | number | null;
  total_price?: MindeeField<number> | number | null;
};

export type ReceiptTaxField = {
  rate?: MindeeField<number> | number | null;
  base?: MindeeField<number> | number | null;
  amount?: MindeeField<number> | number | null;
};

export type ReceiptFields = {
  supplier_name?: MindeeField<string> | string | null;
  merchant_name?: MindeeField<string> | string | null;
  vendor?: MindeeField<string> | string | null;
  purchase_description?: MindeeField<string> | string | null;
  description?: MindeeField<string> | string | null;
  date?: MindeeField<string> | string | null;
  time?: MindeeField<string> | string | null;
  total_amount?: MindeeField<number> | number | null;
  amount?: MindeeField<number> | number | null;
  tip?: MindeeField<number> | number | null;
  total_tax?: MindeeField<number> | number | null;
  taxes?: ReceiptTaxField[];
  line_items?: ReceiptLineItemField[];
  purchase_category?: MindeeField<string> | string | null;
  purchase_subcategory?: MindeeField<string> | string | null;
};

export type ExpenseLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type ExpenseTax = {
  rate: number;
  base: number;
  amount: number;
};

export type ReceiptExpense = {
  amount: string;
  payee: string;
  note: string;
  category: string;
  subcategoryId: string;
  merchant: string;
  total: number | null;
  tax: number | null;
  date: string | null;
  time: string | null;
  items: ExpenseLineItem[];
  taxes: ExpenseTax[];
};

export type ReceiptDraftPatch = Partial<Pick<SingleDraft, 'amount' | 'category' | 'subcategoryId' | 'payee' | 'note'>>;

export type ReceiptImportResult = {
  draftPatch: ReceiptDraftPatch;
  expense: ReceiptExpense;
};
