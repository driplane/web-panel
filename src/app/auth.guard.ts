import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { map, shareReplay, tap } from 'rxjs';
import { restoreLastSession } from './auth.actions';
import { loggedInUser } from './auth.selectors';
import Logger from './logger.service';
const log = Logger('guard:auth');

export const AuthGuard: CanActivateFn = () => {
  log('checking auth...');

  const store = inject(Store);
  const router = inject(Router);
  store.dispatch(restoreLastSession());

  return store.pipe(
    select(loggedInUser),
    tap((user) => log('user', user)),
    shareReplay(1),
    map((user) => !!user),
    tap((loggedIn) => {
      if (loggedIn === false) {
        router.navigate(['/login']);
      }
    })
  );
};
