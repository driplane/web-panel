import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LS_TOKEN_KEY } from './auth.effects';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(public router: Router) {}
  canActivate(): Promise<boolean> {
    return new Promise(resolve => {
      if (localStorage.getItem(LS_TOKEN_KEY)) {
        resolve(true);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
