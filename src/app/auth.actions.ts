import { createAction, props } from '@ngrx/store';

const _ = log => `[Auth] ${log}`;

export const logIn = createAction(_('Log in'), props<{ username: string; password: string }>());
export const logInSuccess = createAction(_('Log in success'), props<{ token: string; expiresAt: Date }>());

export const signOut = createAction(_('Sign out'));
export const signOutSuccess = createAction(_('Sign out successful'));
