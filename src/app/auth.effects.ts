import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { of, EMPTY } from 'rxjs';
import { logIn, logInFailed, logInSuccess, restoreLastSession, setSession, signOut, signOutSuccess, tokenInvalid } from './auth.actions';
import { DriplaneService } from './driplane.service';
import * as dayjs from 'dayjs';
import { loadProjects } from './project.actions';
import { Router } from '@angular/router';

export const LS_TOKEN_KEY = 'auth';
export const LS_TOKEN_EXPIRE_KEY = 'auth_expire';

@Injectable()
export class AuthEffects {
  restoreLastSession$ = createEffect(() => this.actions$.pipe(
    ofType(restoreLastSession),
    map(() => {
      console.log('restoreLastSession');
      if (localStorage.getItem(LS_TOKEN_KEY)) {
        const token = localStorage.getItem(LS_TOKEN_KEY);
        const expiresAt = dayjs(localStorage.getItem(LS_TOKEN_EXPIRE_KEY)).toDate();
        this.driplane.setToken(token);
        console.log('session restored');
        return setSession({ token, expiresAt });
      }
      console.log('Nothing to restore;')
      return EMPTY;
    })
  ), { dispatch: false });

  logIn$ = createEffect(() => this.actions$.pipe(
    ofType(logIn),
    mergeMap(({ username, password }) => this.driplane.login(username, password)
      .pipe(
        map(({ token }) => logInSuccess({ token, expiresAt: dayjs().add(7, 'day').toDate()})),
        catchError((error) => of(logInFailed({ message: 'Login failed. Please check your e-mail address and password.' })))
      )
    ),
  ), { useEffectsErrorHandler: false });

  loginSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(logInSuccess),
    tap(({ token, expiresAt }) => {
      localStorage.setItem(LS_TOKEN_KEY, token);
      localStorage.setItem(LS_TOKEN_EXPIRE_KEY, dayjs(expiresAt).toISOString());
      this.driplane.setToken(token);
      this.router.navigate(['/']);
    }),
    map(_ => loadProjects())
  ));

  tokenInvalid$ = createEffect(() => this.actions$.pipe(
    ofType(tokenInvalid),
    tap(() => {
      localStorage.removeItem(LS_TOKEN_KEY);
      localStorage.removeItem(LS_TOKEN_EXPIRE_KEY);
    }),
  ), { dispatch: false });

  signOut$ = createEffect(() => this.actions$.pipe(
    ofType(signOut),
    tap(() => {
      console.log('sign out');
      localStorage.removeItem(LS_TOKEN_KEY);
      localStorage.removeItem(LS_TOKEN_EXPIRE_KEY);
      this.driplane.setToken(null);
    }),
    map(() => signOutSuccess()),
  ));

  signOutSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(signOutSuccess),
    tap(() => {
      console.log('sign out success');
      this.router.navigate(['/login']);
    })
  ), { dispatch: false });

  constructor(
    private actions$: Actions,
    private driplane: DriplaneService,
    private router: Router
  ) {}

  ngrxOnInitEffects() {
    return restoreLastSession();
  }

}
