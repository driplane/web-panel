import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, of } from 'rxjs';
import { catchError, exhaustMap, flatMap, map, mergeMap, tap, throttleTime } from 'rxjs/operators';
import { DriplaneService } from '../../driplane.service';
import Logger from '../../logger.service';
import { addProject, addProjectKey, deleteProject, deleteProjectFailed, deleteProjectKey, deleteProjectKeyFailed, deleteProjectKeySuccess, deleteProjectSuccess, loadProjectFailed, loadProjectKeys, loadProjectKeysSuccess, loadProjectSuccess, loadProjects, switchProject, switchProjectSuccess, updateProjectKey } from './project.actions';
const log = Logger('effects:project');

@Injectable()
export class ProjectEffects {

  addProject$ = createEffect(() => this.actions$.pipe(
    ofType(addProject),
    exhaustMap(({ project }) => this.driplane.createProject(project)
      .pipe(
        mergeMap((project) => [
          addProjectKey({ project, projectKey: { name: "Main Key", read: false, write: true, auto_filter: {}, auto_fill: {}, auto_fill_template:{
            city: "geoip.city",
            country: "geoip.country_code"
          }} }),
          loadProjects(),
        ]),
        catchError(() => EMPTY)
      )
    )
  ));

  deleteProject$ = createEffect(() => this.actions$.pipe(
    ofType(deleteProject),
    exhaustMap(({ projectId }) => this.driplane.deleteProject(projectId)
    .pipe(
        map(() => deleteProjectSuccess()),
        catchError(() => of(deleteProjectFailed()))
      )
    )
  ));

  deleteProjectSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(deleteProjectSuccess),
    // tap(() => this.router.navigate(['/projects'])),
    map(() => loadProjects())
  ));

  loadProjects$ = createEffect(() => this.actions$.pipe(
    ofType(loadProjects),
    throttleTime(500),
    exhaustMap(() => this.driplane.getProjects()
      .pipe(
        map(projects => {
          if (projects.length === 0) {
            log('No projects found. Creating default project...');
            return addProject({ project: { name: 'Default Project' } });
          }
          return loadProjectSuccess({ projects })
        }),
        catchError(() => of(loadProjectFailed()))
      )
    )
  ));

  loadProjectKeys$ = createEffect(() => this.actions$.pipe(
    ofType(loadProjectKeys),
    exhaustMap(({ project }) => this.driplane.getProjectsKeys(project)
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
    exhaustMap(({ project, projectKey }) => this.driplane.createProjectKey(project, projectKey)
      .pipe(
        map(() => loadProjectKeys({ project })),
        catchError(() => EMPTY)
      )
    )
  ));


  updateProjectKey$ = createEffect(() => this.actions$.pipe(
    ofType(updateProjectKey),
    exhaustMap(({ project, projectKey }) => this.driplane.updateProjectKey(project, projectKey)
      .pipe(
        map(() => loadProjectKeys({ project })),
        catchError(() => EMPTY)
      )
    )
  ));

  deleteProjectKey$ = createEffect(() => this.actions$.pipe(
    ofType(deleteProjectKey),
    exhaustMap(({ project, projectKey }) => this.driplane.deleteProjectKey(project, projectKey)
      .pipe(
        map(() => deleteProjectKeySuccess({ project })),
        catchError(() => of(deleteProjectKeyFailed()))
      )
    )
  ));

  deleteProjectKeySuccess$ = createEffect(() => this.actions$.pipe(
    ofType(deleteProjectKeySuccess),
    map(({ project }) => loadProjectKeys({ project }))
  ));

  constructor(
    private actions$: Actions,
    private driplane: DriplaneService,
    private router: Router
  ) {}
}
