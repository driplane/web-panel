import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { logIn } from '../auth.actions';
import { isLoggedIn } from '../auth.selectors';
import { DriplaneService } from '../driplane.service';
import Logger from '../logger.service';
const log = Logger('page:login');

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  isOpen = true;

  username = '';
  password = '';

  unsubscribe: Subject<void> = new Subject();

  loginSuccess$ = this.store.pipe(
    select(isLoggedIn),
    takeUntil(this.unsubscribe)
  );

  constructor(private router: Router, private store: Store) {
    log('construction');
  }

  ngOnInit() {
    this.loginSuccess$.subscribe(loggedIn => {
      if (loggedIn) {
        this.isOpen = false;
        this.router.navigate(['/'], {
          replaceUrl: true
        });
      }
    });
  }

  signIn(form: NgForm) {
    if (form.valid) {
      this.store.dispatch(logIn({ username: this.username, password: this.password }));
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
   }
}
