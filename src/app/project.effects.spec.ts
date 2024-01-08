import { Observable, throwError } from 'rxjs';
import { DriplaneService } from './driplane.service';
import { ProjectEffects } from './project.effects';
import { loadProjects, loadProjectSuccess } from './project.actions';
import { hot, cold } from 'jasmine-marbles';
import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';

describe('ProjectEffects', () => {
  let actions$: Observable<Action>;
  let effects: ProjectEffects;
  let driplaneService: jasmine.SpyObj<DriplaneService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('DriplaneService', ['getProjects']);

    TestBed.configureTestingModule({
      providers: [
        ProjectEffects,
        provideMockActions(() => actions$),
        { provide: DriplaneService, useValue: spy }
      ]
    });

    effects = TestBed.inject(ProjectEffects);
    driplaneService = TestBed.inject(DriplaneService) as jasmine.SpyObj<DriplaneService>;
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  it('should dispatch loadProjectSuccess action when driplaneService.getProjects is successful', () => {
    const projects = [
      { id: '1', name: 'Project 1', created_at: Date().toString(), secret: 'secret1', keys: [] },
      { id: '2', name: 'Project 2', created_at: Date().toString(), secret: 'secret2', keys: [] }
    ];
    const action = loadProjects();
    const outcome = loadProjectSuccess({ projects });

    actions$ = hot('-a', { a: action });
    const response = cold('-a|', { a: projects });
    const expected = cold('--b', { b: outcome });
    driplaneService.getProjects.and.returnValue(response);

    expect(effects.loadProjects$).toBeObservable(expected);
  });

  it('should not dispatch any action when driplaneService.getProjects is unsuccessful', () => {
    const action = loadProjects();
    const error = 'Error';
    const response = cold('-#|', {}, error);

    actions$ = hot('-a', { a: action });
    driplaneService.getProjects.and.returnValue(response);

    const expected = cold('--b', { b: { type: 'loadProjectsFailed' } });
    expect(effects.loadProjects$).toBeObservable(expected);
  });
});
