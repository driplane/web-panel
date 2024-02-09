import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, merge, of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { DriplaneService } from './driplane.service';
import { loadProjects, loadProjectSuccess, loadProjectKeys, loadProjectKeysSuccess, switchProject, addProjectKey, addProject } from './project.actions';

@Injectable()
export class ProjectEffects {

  addProject$ = createEffect(() => this.actions$.pipe(
    ofType(addProject),
    mergeMap(({ project }) => this.driplane.createProject(project)
      .pipe(
        map((project) => addProjectKey({ project, projectKey: { name: "Main Key", read: true, write: true, auto_fill: {}} })),
        map(() => loadProjects()),
        catchError(() => EMPTY)
      )
    )
  ), { dispatch: false });

  loadProjects$ = createEffect(() => this.actions$.pipe(
    ofType(loadProjects),
    mergeMap(() => this.driplane.getProjects()
      .pipe(
        map(projects => loadProjectSuccess({ projects })),
        catchError(() => of({ type: 'loadProjectsFailed' }))
      )
    )
  ));

  loadProjectKeys$ = createEffect(() => this.actions$.pipe(
    ofType(loadProjectKeys),
    mergeMap(({ project }) => this.driplane.getProjectsKeys(project)
      .pipe(
        map((projectKeys) => loadProjectKeysSuccess({ project, projectKeys })),
        catchError(() => EMPTY)
      )
    )
  ));

  switchProject$ = createEffect(() => this.actions$.pipe(
    ofType(switchProject),
    tap(({activeProject}) => {
      localStorage.setItem('lastProjectId', activeProject);
    })
  ), { dispatch: false });

  addProjectKey$ = createEffect(() => this.actions$.pipe(
    ofType(addProjectKey),
    mergeMap(({ project, projectKey }) => this.driplane.createProjectKey(project, projectKey)
      .pipe(
        map(() => loadProjectKeys({ project })),
        catchError(() => EMPTY)
      )
    )
  ), { dispatch: false });

  constructor(
    private actions$: Actions,
    private driplane: DriplaneService
  ) {}
}
