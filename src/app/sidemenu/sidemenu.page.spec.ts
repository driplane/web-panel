import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { MemoizedSelector, Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Project } from '../driplane.types';
import { loadProjects } from '../project.actions';
import { ProjectState } from '../project.reducer';
import { activeProject, projects } from '../project.selectors';

import { SidemenuPage } from './sidemenu.page';

describe('SidemenuPage', () => {
  let component: SidemenuPage;
  let fixture: ComponentFixture<SidemenuPage>;
  let store: MockStore;
  const initialState = { projects: [{id: '1', name: 'Test'}], activeProject: '1' };
  let mockActiveProjectSelector: MemoizedSelector<ProjectState, Project>;
  let mockProjectsSelector: MemoizedSelector<ProjectState, Project[]>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SidemenuPage],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        provideMockStore({ initialState }),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    store = TestBed.inject(MockStore);

    spyOn(store, 'dispatch');

    const mockProject: Project = {
      id: '1',
      name: 'Test',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      created_at: '',
      secret: '',
      keys: []
    };

    mockActiveProjectSelector = store.overrideSelector(activeProject, mockProject);
    mockProjectsSelector = store.overrideSelector(projects, [mockProject]);

    fixture = TestBed.createComponent(SidemenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch projects', () => {
    expect(store.dispatch).toHaveBeenCalledWith(loadProjects());
  });
});
