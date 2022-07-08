import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { DriplaneService } from '../driplane.service';
import { ProjectState, PROJECT_FEATURE_KEY } from '../project.reducer';

import { SettingsPage } from './settings.page';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;
  let store: MockStore<{ [PROJECT_FEATURE_KEY]: ProjectState }>;
  const initialState = { [PROJECT_FEATURE_KEY]: { projects: [], activeProject: null } };

  beforeEach(async () => {
    const mockDriplaneService = jasmine.createSpyObj(['login']);

    await TestBed.configureTestingModule({
      declarations: [ SettingsPage ],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: DriplaneService, useValue: mockDriplaneService },
        provideMockStore({ initialState }),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
