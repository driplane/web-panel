import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { DriplaneService } from '../driplane.service';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PROJECT_FEATURE_KEY } from '../project.reducer';
import { ProjectPage } from './project.page';

describe('ProjectPage', () => {
  let component: ProjectPage;
  let fixture: ComponentFixture<ProjectPage>;
  let store: MockStore;
  const initialState = { [PROJECT_FEATURE_KEY]: { projects: [], activeProject: null } };

  beforeEach(async () => {
    const mockActivatedRoute = { snapshot: { params: { uuid: '123' } } };
    const mockDriplaneService = jasmine.createSpyObj(['login']);

    await TestBed.configureTestingModule({
      declarations: [ ProjectPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: DriplaneService, useValue: mockDriplaneService },
         provideMockStore({ initialState }),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    store = TestBed.inject(MockStore);

    fixture = TestBed.createComponent(ProjectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
