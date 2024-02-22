import { createReducer, on } from '@ngrx/store';
import { showToast } from './toast.actions';

export const TOAST_FEATURE_KEY = 'toast';

export interface ToastState {
  messages: string[] | null;
}

export const initialState: ToastState = {
  messages: null,
};

export const projectReducer = createReducer(
  initialState,
  on(showToast, (state, { message }) => ({
    ...state,
    messages: [...state.messages, message],
  })),
);
