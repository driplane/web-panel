import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TOAST_FEATURE_KEY, ToastState } from './toast.reducer';

export const selectToastState = createFeatureSelector<ToastState>(
  TOAST_FEATURE_KEY,
);


export const toastMessages = createSelector(
  selectToastState,
  (state: ToastState) => state?.messages,
);
