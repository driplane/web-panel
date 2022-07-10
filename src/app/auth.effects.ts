import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { of, EMPTY } from 'rxjs';
import { logIn, logInSuccess, signOut, signOutSuccess } from './auth.actions';
import { DriplaneService } from './driplane.service';

@Injectable()
export class AuthEffects {

  logIn$ = createEffect(() => this.actions$.pipe(
    ofType(logIn),
    mergeMap(({ username, password }) => this.driplane.login(username, password)
      .pipe(
        tap({ token, })
        map(({ token }) => logInSuccess({ token, expiresAt: new Date()})),
        catchError(() => EMPTY)
      )
    )
  ));

  signOut$ = createEffect(() => this.actions$.pipe(
    ofType(signOut),
    map(() => of(localStorage.removeItem('auth'))),
    map(() => signOutSuccess()),
  ));

  constructor(
    private actions$: Actions,
    private driplane: DriplaneService
  ) {}
}
