import { createAction, props } from '@ngrx/store';
import { User } from '../../driplane.types';

const _ = log => `[Auth] ${log}`;

export const restoreLastSession = createAction(_('Restore last session'));
export const restoreLastSessionSuccess = createAction(_('Restore last session success'), props<{ loggedIn: boolean; token: string; expiresAt: Date }>());

export const setSession = createAction(_('Set session data'), props<{ token: string; expiresAt: Date, user: User }>());

export const logIn = createAction(_('Log in'), props<{ username: string; password: string }>());
export const logInSuccess = createAction(_('Log in success'), props<{ token: string; expiresAt: Date }>());
export const logInFailed = createAction(_('Log in failed'), props<{ message: string }>());
export const logInFailedClear = createAction(_('Log in failed clear'));

export const signOut = createAction(_('Sign out'));
export const signOutSuccess = createAction(_('Sign out successful'));

export const tokenInvalid = createAction(_('Token invalid'));
export const tokenExpired = createAction(_('Token expired'));
