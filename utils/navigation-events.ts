import { DeviceEventEmitter, EmitterSubscription } from 'react-native';

import { SingleDraft } from '@/types/transactions';

export const NAV_EVENTS = {
  CATEGORY_SELECTED: 'nav-category-selected',
  RECORD_DETAIL_UPDATED: 'nav-record-detail-updated',
} as const;

export type CategorySelectedPayload = {
  target: string;
  category: string;
  subcategoryId?: string;
  recordIndex?: number;
};

export type RecordDetailUpdatedPayload = {
  target: string;
  recordIndex: number;
  record: SingleDraft;
};

const addListener = <T,>(eventName: string, handler: (payload: T) => void): (() => void) => {
  const subscription: EmitterSubscription = DeviceEventEmitter.addListener(eventName, handler);
  return () => subscription.remove();
};

export const emitCategorySelection = (payload: CategorySelectedPayload) => {
  DeviceEventEmitter.emit(NAV_EVENTS.CATEGORY_SELECTED, payload);
};

export const subscribeToCategorySelection = (handler: (payload: CategorySelectedPayload) => void) =>
  addListener<CategorySelectedPayload>(NAV_EVENTS.CATEGORY_SELECTED, handler);

export const emitRecordDetailUpdate = (payload: RecordDetailUpdatedPayload) => {
  DeviceEventEmitter.emit(NAV_EVENTS.RECORD_DETAIL_UPDATED, payload);
};

export const subscribeToRecordDetailUpdates = (handler: (payload: RecordDetailUpdatedPayload) => void) =>
  addListener<RecordDetailUpdatedPayload>(NAV_EVENTS.RECORD_DETAIL_UPDATED, handler);
