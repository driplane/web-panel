import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { addDays, formatISO, parseISO } from 'date-fns';
import { EMPTY, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { logIn, logInFailed, logInSuccess, restoreLastSession, setSession, signOut, signOutSuccess, tokenExpired, tokenInvalid } from './auth.actions';
import { DriplaneService } from '../../driplane.service';
import { loadProjects } from '../project/project.actions';
import Logger from '../../logger.service';
import { showToast } from '../toast/toast.actions';
const log = Logger('effects:auth');

export const LS_TOKEN_KEY = 'auth';
export const LS_TOKEN_EXPIRE_KEY = 'auth_expire';

@Injectable()
export class AuthEffects {
  restoreLastSession$ = createEffect(() => this.actions$.pipe(
    ofType(restoreLastSession),
    switchMap(() => {
      log('restoreLastSession');
      if (localStorage.getItem(LS_TOKEN_KEY)) {
        const token = localStorage.getItem(LS_TOKEN_KEY);
        const expiresAt = parseISO(localStorage.getItem(LS_TOKEN_EXPIRE_KEY));

        if (expiresAt && expiresAt < new Date()) {
          return of(tokenExpired());
        }

        this.driplane.setToken(token);

        return this.driplane.me().pipe(
          tap((user) => log('restored user', user)),
          map((user) => setSession({ token, expiresAt, user })),
          catchError(() => of(tokenInvalid()))
        );
      }
      log('Nothing to restore;')
      return of(tokenInvalid());
    }),
  ));

  logIn$ = createEffect(() => this.actions$.pipe(
    ofType(logIn),
    mergeMap(({ username, password }) => this.driplane.login(username, password)
      .pipe(
        map(({ token }) => logInSuccess({ token, expiresAt: addDays(Date(), 7) })),
        catchError((error) => {
          log('login failed', error);
          return of(logInFailed({ message: 'Login failed. Please check your e-mail address and password.' }))
        })
      )
    ),
  ));

  loginSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(logInSuccess),
    tap(({ token, expiresAt }) => {
      localStorage.setItem(LS_TOKEN_KEY, token);
      localStorage.setItem(LS_TOKEN_EXPIRE_KEY, formatISO(expiresAt));
      location.href = '/';
    }),
  ), { dispatch: false });

  tokenExpiredMessage$ = createEffect(() => this.actions$.pipe(
    ofType(tokenExpired),
    map(() => showToast({ message: 'Your session has expired. Please log in again.' })),
  ));

  cleanupToken$ = createEffect(() => this.actions$.pipe(
    ofType(tokenExpired, tokenInvalid, signOut),
    tap(() => {
      localStorage.removeItem(LS_TOKEN_KEY);
      localStorage.removeItem(LS_TOKEN_EXPIRE_KEY);
      this.driplane.setToken(null);
    }),
    map(() => signOutSuccess())
  ));

  signOut$ = createEffect(() => this.actions$.pipe(
    ofType(signOut),
    tap(() => {
      log('sign out');
      this.router.navigate(['/login']);
    }),
    map(() => showToast({ message: 'You signed out successfully!' })),
  ));

  // signOutSuccess$ = createEffect(() => this.actions$.pipe(
  //   ofType(signOutSuccess),
  //   tap(() => {
  //     log('sign out success');
  //     // this.router.navigate(['/login']);
  //   })
  // ), { dispatch: false });

  constructor(
    private actions$: Actions,
    private driplane: DriplaneService,
    private router: Router
  ) { }

  ngrxOnInitEffects() {
    return restoreLastSession();
  }

}
