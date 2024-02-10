import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, merge, of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { DriplaneService } from './driplane.service';
import { loadProjects, loadProjectSuccess, loadProjectKeys, loadProjectKeysSuccess, switchProject, addProjectKey, addProject, switchProjectSuccess } from './project.actions';
import Logger from './logger.service';
import { routerNavigationAction } from '@ngrx/router-store';
import { Router } from '@angular/router';
const log = Logger('effects:project');

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
  ));

  loadProjects$ = createEffect(() => this.actions$.pipe(
    ofType(loadProjects),
    mergeMap(() => this.driplane.getProjects()
      .pipe(
        map(projects => {
          if (projects.length === 0) {
            log('No projects found. Creating default project...');
            addProject({ project: { name: 'Default Project' } });
          }
          return loadProjectSuccess({ projects })
        }),
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
      this.router.navigate(['/projects', activeProject]);
    }),
    map(({activeProject}) => switchProjectSuccess({ activeProject: activeProject }))
  ));

  addProjectKey$ = createEffect(() => this.actions$.pipe(
    ofType(addProjectKey),
    mergeMap(({ project, projectKey }) => this.driplane.createProjectKey(project, projectKey)
      .pipe(
        map(() => loadProjectKeys({ project })),
        catchError(() => EMPTY)
      )
    )
  ));

  constructor(
    private actions$: Actions,
    private driplane: DriplaneService,
    private router: Router
  ) {}
}
