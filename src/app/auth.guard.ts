import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

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
