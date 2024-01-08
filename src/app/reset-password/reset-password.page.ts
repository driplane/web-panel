import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { DriplaneService } from '../driplane.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  tokenFlow = false;
  token: string;

  mailSent = false;
  passwordChanged = false;

  email = '';

  newPassword = '';
  newPassword1 = '';

  constructor(private router: ActivatedRoute, private driplane: DriplaneService) { }

  ngOnInit() {
    this.router.queryParamMap
      .pipe(
        map(paramMap => paramMap.get('token')),
      )
      .subscribe((token) => {
        if (token) {
          this.tokenFlow = true;
          this.token = token;
        }
      });
  }

  resetPassword(form: NgForm) {
    if (form.valid) {
      console.log(this.email);
      this.driplane.passwordReset(this.email)
        .subscribe(() => {
          this.mailSent = true;
        });
    }
  }

  changePassword(form: NgForm) {
    if (form.valid) {
      this.driplane.updatePassword(this.token, this.newPassword)
        .subscribe(() => {
          this.passwordChanged = true;
        });
    }
  }
}
