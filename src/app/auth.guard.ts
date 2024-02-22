import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { filter, map, shareReplay, tap } from 'rxjs';
import { isLoggedIn } from './state/auth/auth.selectors';
import Logger from './logger.service';
const log = Logger('guard:auth');

export const AuthGuard: CanActivateFn = () => {
  log('checking auth...');

  const store = inject(Store);
  const router = inject(Router);

  return store.pipe(
    select(isLoggedIn),
    filter((loggedIn) => loggedIn !== null),
    tap((loggedIn) => {
      log('loggedIn', loggedIn)
      if (loggedIn === false) {
        log('not logged in; redirecting to login');
        router.navigate(['/login']);
      }
    })
  );
};
