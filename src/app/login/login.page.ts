import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DriplaneService } from '../driplane.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  username = '';
  password = '';

  constructor(private router: Router, private driplane: DriplaneService) {
    if (localStorage.getItem('auth')) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
  }

  signIn(form: NgForm) {
    if (form.valid) {
      this.driplane.login(this.username, this.password).subscribe((resp) => {
        localStorage.setItem('auth', resp.token);
        console.log(resp);
        this.router.navigate(['/']);
      });
    }
  }
}
