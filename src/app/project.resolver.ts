import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { DriplaneService } from './driplane.service';
import { Injectable } from '@angular/core';
import { Project } from './driplane.types';
import { Store } from '@ngrx/store';
import { activeProject } from './project.selectors';
import { switchProject } from './project.actions';

@Injectable({
  providedIn: 'root',
})
export class ProjectIdResolverService
  implements Resolve<Project | null> {

  activeProject$ = this.store.select(activeProject);

  constructor(
    private readonly apiService: DriplaneService,
    private readonly router: Router,
    private readonly store: Store
  ) {}

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<Project | null> | Observable<never> {
    const urlId = route.paramMap.get('projectId');

    return this.apiService.getProject(urlId).pipe(
      catchError(() => {
        console.error('project not found');
        this.router.navigate(['/project-not-found/' + urlId]);
        return EMPTY;
      }),
      map((project: Project) => {
        this.store.dispatch(switchProject({ activeProject: project.id }));
        return project;
      })
    );
  }
}
