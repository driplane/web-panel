import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DriplaneService } from '../driplane.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {
  username = '';
  password = '';
  password2 = '';

  success = false;

  constructor(private driplane: DriplaneService) { }

  signUp(form: NgForm) {
    form.controls['username'].markAsTouched();
    form.controls['password'].markAsTouched();
    form.controls['password2'].markAsTouched();

    if (form.valid) {
      this.driplane.register(this.username, this.password).subscribe((resp) => {
        this.success = true;
      });
    }
  }
}
