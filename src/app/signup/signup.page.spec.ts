import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { DriplaneService } from '../driplane.service';

import { SignupPage } from './signup.page';

describe('SignupPage', () => {
  let component: SignupPage;
  let fixture: ComponentFixture<SignupPage>;

  beforeEach(waitForAsync(() => {
    const mockDriplaneService = jasmine.createSpyObj(['register']);

    TestBed.configureTestingModule({
      declarations: [ SignupPage ],
      imports: [IonicModule.forRoot(), FormsModule, RouterTestingModule],
      providers: [
        { provide: DriplaneService, useValue: mockDriplaneService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
