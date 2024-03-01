import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import {
  distinctUntilChanged,
  filter,
  switchMap,
  tap
} from 'rxjs/operators';
import { logIn, logInFailedClear } from '../state/auth/auth.actions';
import { loginFailed } from '../state/auth/auth.selectors';
import Logger from '../logger.service';
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
      const errors = this.loginForm.controls.username.errors || {};
      if (error) {
        errors['loginFailed'] = true;
      } else {
        delete errors['loginFailed'];
      }

      // check if errors is empty object
      if (Object.keys(errors).length === 0) {
        this.loginForm.controls.username.setErrors(null);
      } else {
        this.loginForm.controls.username.setErrors({ ...errors });
      }
    })
  );

  constructor(private store: Store) {
    log('construction');

    this.logInFailed$.pipe(
      filter((failed) => !!failed),
      switchMap(() => this.loginForm.valueChanges)
    ).subscribe((value) => {
      log('value changed', value);
      this.store.dispatch(logInFailedClear());
    });
  }

  signIn() {
    this.loginForm.controls['username'].markAsTouched();
    this.loginForm.controls['password'].markAsTouched();

    if (this.loginForm.valid) {
      this.store.dispatch(logInFailedClear());
      this.store.dispatch(
        logIn({
          username: this.loginForm.value.username,
          password: this.loginForm.value.password,
        })
      );
    }
  }
}
