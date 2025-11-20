import { BatchDraft, INITIAL_SINGLE_DRAFT, RecordType, SingleDraft, createBatchDraft } from '@/types/transactions';

const cloneSingle = (draft: SingleDraft): SingleDraft => ({
  ...draft,
  labels: Array.isArray(draft.labels) ? [...draft.labels] : [],
});
const cloneBatch = (draft: BatchDraft): BatchDraft => ({ ...draft });
const cloneBatchArray = (drafts: BatchDraft[]): BatchDraft[] => drafts.map(cloneBatch);

const createInitialBatchDrafts = (category: string): BatchDraft[] => [
  createBatchDraft(category),
  createBatchDraft(category),
];

let singleDraftMemory: SingleDraft = cloneSingle(INITIAL_SINGLE_DRAFT);
let batchDraftsMemory: BatchDraft[] = createInitialBatchDrafts(INITIAL_SINGLE_DRAFT.category);
let transactionTypeMemory: RecordType = 'expense';
let lastSelectedCategoryMemory: { income?: string; expense?: string } = {
  expense: INITIAL_SINGLE_DRAFT.category,
};

const ensureCategory = (category?: string): string => category || lastSelectedCategoryMemory.expense || INITIAL_SINGLE_DRAFT.category;

export const transactionDraftState = {
  getSingleDraft(): SingleDraft {
    return cloneSingle(singleDraftMemory);
  },

  setSingleDraft(draft: SingleDraft) {
    singleDraftMemory = cloneSingle(draft);
  },

  resetSingleDraft(category?: string): SingleDraft {
    const nextCategory = ensureCategory(category);
    const baseDraft: SingleDraft = {
      ...INITIAL_SINGLE_DRAFT,
      category: nextCategory,
      labels: [],
      occurredAt: undefined,
    };
    const next = cloneSingle(baseDraft);
    singleDraftMemory = next;
    return cloneSingle(next);
  },

  getBatchDrafts(category?: string): BatchDraft[] {
    if (batchDraftsMemory.length === 0) {
      batchDraftsMemory = createInitialBatchDrafts(ensureCategory(category));
    }
    return cloneBatchArray(batchDraftsMemory);
  },

  setBatchDrafts(drafts: BatchDraft[]) {
    batchDraftsMemory = cloneBatchArray(drafts);
  },

  resetBatchDrafts(category?: string, { pairs = true }: { pairs?: boolean } = {}): BatchDraft[] {
    const baseCategory = ensureCategory(category);
    batchDraftsMemory = pairs
      ? createInitialBatchDrafts(baseCategory)
      : [createBatchDraft(baseCategory)];
    return cloneBatchArray(batchDraftsMemory);
  },

  getTransactionType(): RecordType {
    return transactionTypeMemory;
  },

  setTransactionType(type: RecordType) {
    transactionTypeMemory = type;
  },

  getLastSelectedCategory(type?: RecordType): string {
    if (type) {
      return lastSelectedCategoryMemory[type] ?? INITIAL_SINGLE_DRAFT.category;
    }
    return lastSelectedCategoryMemory[transactionTypeMemory] ?? INITIAL_SINGLE_DRAFT.category;
  },

  setLastSelectedCategory(category: string, type?: RecordType) {
    if (category) {
      const key = type ?? transactionTypeMemory;
      lastSelectedCategoryMemory[key] = category;
    }
  },

  resetAll(category?: string) {
    const baseCategory = ensureCategory(category);
    const baseSingle: SingleDraft = {
      ...INITIAL_SINGLE_DRAFT,
      category: baseCategory,
      labels: [],
      occurredAt: undefined,
    };
    singleDraftMemory = cloneSingle(baseSingle);
    batchDraftsMemory = createInitialBatchDrafts(baseCategory);
  },
};
