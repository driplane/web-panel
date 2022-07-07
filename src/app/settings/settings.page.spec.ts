import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { DriplaneService } from '../driplane.service';
import { ProjectState, PROJECT_FEATURE_KEY } from '../project.reducer';
import { SettingsPageRoutingModule } from './settings-routing.module';

import { SettingsPage } from './settings.page';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;
  let store: MockStore<{ [PROJECT_FEATURE_KEY]: ProjectState }>;
  const initialState = { [PROJECT_FEATURE_KEY]: { projects: [], activeProject: null } };

  beforeEach(waitForAsync(() => {
    const mockActivatedRoute = { snapshot: { params: { uuid: '123' } } };
    const mockRouter = { navigate: jasmine.createSpy('navigate'), queryParamMap: of(new Map([['projectId', '1']])) };
    const mockDriplaneService = jasmine.createSpyObj(['login']);

    TestBed.configureTestingModule({
      declarations: [ SettingsPage ],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: DriplaneService, useValue: mockDriplaneService },
        provideMockStore({ initialState }),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
