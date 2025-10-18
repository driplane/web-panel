import { createReducer, on } from '@ngrx/store';
import {
  loadClientConfigSuccess,
  logInFailed,
  logInFailedClear,
  logInSuccess,
  setSession,
  signOutSuccess,
  updateClientConfigSuccess
} from './auth.actions';
import { ClientConfig, User } from '../../driplane.types';

export const AUTH_FEATURE_KEY = 'auth';

export interface AuthState {
  loggedIn: boolean | null;
  token: string;
  expiresAt: Date;
  errorMessage: string;
  me: User;
  clientConfig: ClientConfig;
}

export const initialState: AuthState = {
  loggedIn: null,
  token: '',
  expiresAt: null,
  errorMessage: '',
  me: null,
  clientConfig: {}
};

export const authReducer = createReducer(
  initialState,
  on(setSession, (state, { token, expiresAt, user }) => ({
    ...state,
    loggedIn: true,
    token,
    expiresAt,
    me: user,
    clientConfig: user.client_config
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

  on(loadClientConfigSuccess, (state, { clientConfig }) => ({
    ...state,
    clientConfig
  })),

  on(updateClientConfigSuccess, (state, { clientConfig }) => ({
    ...state,
    clientConfig
  }))
);
