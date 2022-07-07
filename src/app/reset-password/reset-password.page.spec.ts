import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { DriplaneService } from '../driplane.service';

import { ResetPasswordPage } from './reset-password.page';

describe('ResetPasswordPage', () => {
  let component: ResetPasswordPage;
  let fixture: ComponentFixture<ResetPasswordPage>;

  beforeEach(waitForAsync(() => {
    const mockActivatedRoute = { snapshot: { params: { uuid: '123' } }, queryParamMap: of(new Map([['token', '1']])) };
    const mockDriplaneService = jasmine.createSpyObj(['login']);

    TestBed.configureTestingModule({
      declarations: [ ResetPasswordPage ],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: DriplaneService, useValue: mockDriplaneService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
