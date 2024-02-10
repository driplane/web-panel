import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LS_TOKEN_KEY } from './auth.effects';
import Logger from './logger.service';
const log = Logger('guard:auth');

export const AuthGuard: CanActivateFn = async (
  route,
  state
) => {
  log('checking auth...');

  if (localStorage.getItem(LS_TOKEN_KEY)) {
    return true;
  } else {
    const router = inject(Router);
    router.navigate(['/login']);
    return false;
  }
};
