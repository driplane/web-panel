import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, merge, of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { DriplaneService } from './driplane.service';
import { loadProjects, loadProjectSuccess, loadProjectKeys, loadProjectKeysSuccess, switchProject } from './project.actions';

@Injectable()
export class ProjectEffects {

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

  constructor(
    private actions$: Actions,
    private driplane: DriplaneService
  ) {}
}
