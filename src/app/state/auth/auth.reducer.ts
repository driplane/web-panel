import { createReducer, on } from '@ngrx/store';
import {
  logInFailed,
  logInFailedClear,
  logInSuccess,
  setSession,
  signOutSuccess
} from './auth.actions';
import { User } from '../../driplane.types';

export const AUTH_FEATURE_KEY = 'auth';

export interface AuthState {
  loggedIn: boolean | null;
  token: string;
  expiresAt: Date;
  errorMessage: string;
  me: User;
}

export const initialState: AuthState = {
  loggedIn: null,
  token: '',
  expiresAt: null,
  errorMessage: '',
  me: null
};

export const authReducer = createReducer(
  initialState,
  on(setSession, (state, { token, expiresAt, user }) => ({
    ...state,
    loggedIn: true,
    token,
    expiresAt,
    me: user
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
  })),

  on(logInFailed, (state, { message }) => ({
    ...state,
    errorMessage: message
  })),

  on(logInFailedClear, ((state) => ({
    ...state,
    errorMessage: ''
  }))),
);
