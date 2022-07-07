import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { DriplaneService } from '../driplane.service';

import { VerifyEmailPage } from './verify-email.page';

describe('VerifyEmailPage', () => {
  let component: VerifyEmailPage;
  let fixture: ComponentFixture<VerifyEmailPage>;

  beforeEach(waitForAsync(() => {
    const mockActivatedRoute = { snapshot: { params: { uuid: '123' } }, queryParamMap: of(new Map([['token', '1']])) };
    const mockRouter = { navigate: jasmine.createSpy('navigate') };
    const mockDriplaneService = jasmine.createSpyObj<DriplaneService>(['verifyToken']);

    TestBed.configureTestingModule({
      declarations: [ VerifyEmailPage ],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: DriplaneService, useValue: mockDriplaneService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    mockDriplaneService.verifyToken.and.resolveTo();

    fixture = TestBed.createComponent(VerifyEmailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
