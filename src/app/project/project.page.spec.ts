import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DriplaneService } from '../driplane.service';
import { ProjectPageRoutingModule } from './project-routing.module';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { ProjectPage } from './project.page';
import { Store } from '@ngrx/store';
import { ProjectState, PROJECT_FEATURE_KEY } from '../project.reducer';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ProjectPage', () => {
  let component: ProjectPage;
  let fixture: ComponentFixture<ProjectPage>;
  let store: MockStore<{ [PROJECT_FEATURE_KEY]: ProjectState }>;
  const initialState = { [PROJECT_FEATURE_KEY]: { projects: [], activeProject: null } };

  beforeEach(waitForAsync(() => {
    const mockActivatedRoute = { snapshot: { params: { uuid: '123' } } };
    const mockDriplaneService = jasmine.createSpyObj(['login']);

    TestBed.configureTestingModule({
      declarations: [ ProjectPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: DriplaneService, useValue: mockDriplaneService },
         provideMockStore({ initialState }),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    store = TestBed.get<Store>(Store);

    fixture = TestBed.createComponent(ProjectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
