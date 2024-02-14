import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { map, of, shareReplay, tap } from 'rxjs';
import { restoreLastSession } from './auth.actions';
import { LS_TOKEN_KEY } from './auth.effects';
import Logger from './logger.service';
import { loggedInUser } from './auth.selectors';
const log = Logger('guard:auth');

export const AuthGuard: CanActivateFn = (
  route,
  state
) => {
  log('checking auth...');

  if (localStorage.getItem(LS_TOKEN_KEY)) {
    const store = inject(Store);
    store.dispatch(restoreLastSession());

    return store.pipe(
      select(loggedInUser),
      tap((user) => log('user', user)),
      shareReplay(1),
      map((user) => !!user),
    );
  } else {
    const router = inject(Router);
    router.navigate(['/login']);
    return of(false);
  }
};
