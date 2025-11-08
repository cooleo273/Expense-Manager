import { BatchDraft, INITIAL_SINGLE_DRAFT, RecordType, SingleDraft, createBatchDraft } from '@/types/transactions';

const cloneSingle = (draft: SingleDraft): SingleDraft => ({ ...draft });
const cloneBatch = (draft: BatchDraft): BatchDraft => ({ ...draft });
const cloneBatchArray = (drafts: BatchDraft[]): BatchDraft[] => drafts.map(cloneBatch);

const createInitialBatchDrafts = (category: string): BatchDraft[] => [
  createBatchDraft(category),
  createBatchDraft(category),
];

let singleDraftMemory: SingleDraft = cloneSingle(INITIAL_SINGLE_DRAFT);
let batchDraftsMemory: BatchDraft[] = createInitialBatchDrafts(INITIAL_SINGLE_DRAFT.category);
let transactionTypeMemory: RecordType = 'expense';
let lastSelectedCategoryMemory: string = INITIAL_SINGLE_DRAFT.category;

const ensureCategory = (category?: string): string => category || lastSelectedCategoryMemory || INITIAL_SINGLE_DRAFT.category;

export const transactionDraftState = {
  getSingleDraft(): SingleDraft {
    return cloneSingle(singleDraftMemory);
  },

  setSingleDraft(draft: SingleDraft) {
    singleDraftMemory = cloneSingle(draft);
  },

  resetSingleDraft(category?: string): SingleDraft {
    const nextCategory = ensureCategory(category);
    const next = cloneSingle({ ...INITIAL_SINGLE_DRAFT, category: nextCategory });
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

  getLastSelectedCategory(): string {
    return lastSelectedCategoryMemory;
  },

  setLastSelectedCategory(category: string) {
    if (category) {
      lastSelectedCategoryMemory = category;
    }
  },

  resetAll(category?: string) {
    const baseCategory = ensureCategory(category);
    singleDraftMemory = cloneSingle({ ...INITIAL_SINGLE_DRAFT, category: baseCategory });
    batchDraftsMemory = createInitialBatchDrafts(baseCategory);
  },
};
