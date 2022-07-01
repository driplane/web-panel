import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { DriplaneService } from './driplane.service';
import { loadProjects, loadProjectSuccess } from './project.actions';

@Injectable()
export class ProjectEffects {

  loadProjects$ = createEffect(() => this.actions$.pipe(
    ofType(loadProjects),
    mergeMap(() => this.driplane.getProjects()
      .pipe(
        map(projects => loadProjectSuccess({ projects })),
        catchError(() => EMPTY)
      ))
    )
  );

  constructor(
    private actions$: Actions,
    private driplane: DriplaneService
  ) {}
}
