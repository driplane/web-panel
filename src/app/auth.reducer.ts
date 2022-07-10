import { createReducer, on } from '@ngrx/store';
import {
  signOutSuccess,
} from './auth.actions';

export const AUTH_FEATURE_KEY = 'auth';

export interface AuthState {
  loggedIn: boolean;
  token: string;
  expiresAt: Date;
}

export const initialState: AuthState = {
  loggedIn: false,
  token: '',
  expiresAt: null
};

export const authReducer = createReducer(
  initialState,
  on(signOutSuccess, (state) => ({
    ...state,
    loggedIn: false
  })),
);
