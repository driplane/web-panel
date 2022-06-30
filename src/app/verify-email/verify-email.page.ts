import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { DriplaneService } from '../driplane.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
})
export class VerifyEmailPage implements OnInit {
  success = false;

  constructor(private router: ActivatedRoute, private driplane: DriplaneService) { }

  ngOnInit() {
    this.router.queryParamMap
      .pipe(
        map(paramMap => paramMap.get('token')),
        switchMap((token) => this.driplane.verifyToken(token))
      )
      .subscribe(() => {
        this.success = true;
      });
  }

}
