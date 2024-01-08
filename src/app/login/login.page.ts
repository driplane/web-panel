import { Component, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { logIn } from '../auth.actions';
import Logger from '../logger.service';
const log = Logger('page:login');

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnDestroy {
  isOpen = true;

  username = '';
  password = '';

  unsubscribe: Subject<void> = new Subject();

  constructor(private store: Store) {
    log('construction');
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
