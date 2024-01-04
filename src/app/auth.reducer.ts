import { createReducer, on } from '@ngrx/store';
import {
  logInSuccess,
  setSession,
  signOutSuccess,
} from './auth.actions';

export const AUTH_FEATURE_KEY = 'auth';

export interface AuthState {
  loggedIn: boolean;
  token: string;
  expiresAt: Date;
}

export const initialState: AuthState = {
  loggedIn: localStorage.getItem('auth') ? true : false,
  token: '',
  expiresAt: null
};

export const authReducer = createReducer(
  initialState,
  on(setSession, (state, { token, expiresAt }) => ({
    ...state,
    token,
    expiresAt
  })),

  on(signOutSuccess, (state) => ({
    ...state,
    loggedIn: false,
    token: '',
    expiresAt: null
  })),

  on(logInSuccess, (state, { token, expiresAt }) => ({
    ...state,
    loggedIn: true,
    token,
    expiresAt
  }))
);
