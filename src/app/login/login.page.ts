import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { distinctUntilChanged, filter, repeatWhen, switchMap, takeUntil, tap } from 'rxjs/operators';
import { logIn, logInFailedClear } from '../auth.actions';
import { loginFailed } from '../auth.selectors';
import Logger from '../logger.service';
import { EMPTY, iif, of } from 'rxjs';
const log = Logger('page:login');

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  isOpen = true;

  loginForm = new FormGroup({
    username: new FormControl(),
    password: new FormControl(),
  });

  logInFailed$ = this.store.pipe(
    select(loginFailed),
    distinctUntilChanged(),
    tap((error) => {
      log('Setting loginFailed', error);
      this.loginForm.controls.username.setErrors({ loginFailed: !!error });
    })
  );

  constructor(private store: Store) {
    log('construction');

    this.logInFailed$.pipe(
      tap((error) => log('loginFailed', error)),
      filter((error) => !!error),
      tap((error) => log('after filter', error)),
      switchMap(() => this.loginForm.valueChanges.pipe(
        takeUntil(this.logInFailed$)
      )),
      repeatWhen(() => this.logInFailed$)
    ).subscribe((value) => {
      log('value changed', value);
      this.store.dispatch(logInFailedClear());
    });
  }

  signIn() {
    if (this.loginForm.valid) {
      this.store.dispatch(
        logIn({ username: this.loginForm.value.username, password: this.loginForm.value.password })
      );
    }
  }
}
