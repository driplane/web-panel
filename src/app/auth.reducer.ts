import { createReducer, on } from '@ngrx/store';
import {
  logInFailed,
  logInFailedClear,
  logInSuccess,
  setSession,
  signOutSuccess,
} from './auth.actions';

export const AUTH_FEATURE_KEY = 'auth';

function log(reducer: (state: AuthState) => AuthState) {

  return (state: AuthState) => {
    console.log(state);

    return reducer(state);
  }
}
export interface AuthState {
  loggedIn: boolean;
  token: string;
  expiresAt: Date;
  errorMessage: string
}

export const initialState: AuthState = {
  loggedIn: localStorage.getItem('auth') ? true : false,
  token: '',
  expiresAt: null,
  errorMessage: ''
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
  })),

  on(logInFailed, (state, { message }) => ({
    ...state,
    errorMessage: message
  })),

  on(logInFailedClear, log((state) => ({
    ...state,
    errorMessage: ''
  }))),
);
