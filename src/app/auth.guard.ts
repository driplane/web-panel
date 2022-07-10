import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(public router: Router) {}
  canActivate(): Promise<boolean> {
    return new Promise(resolve => {
      if (localStorage.getItem('auth')) {
        resolve(true);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
