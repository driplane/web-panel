import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DriplaneService } from '../driplane.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  username = '';
  password = '';
  password2 = '';

  success = false;

  constructor(private router: Router, private driplane: DriplaneService) { }

  ngOnInit() {
  }

  signUp(form: NgForm) {
    if (form.valid) {
      this.driplane.register(this.username, this.password).subscribe((resp) => {
        this.success = true;
      });
    }
  }
}
