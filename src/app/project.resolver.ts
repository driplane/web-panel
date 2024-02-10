import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  Router
} from '@angular/router';
import { Store } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DriplaneService } from './driplane.service';
import { Project } from './driplane.types';
import { switchProject, switchProjectSuccess } from './project.actions';
import Logger from './logger.service';
const log = Logger('resolver:projectId');

export const ProjectIdResolverService: ResolveFn<Project> = (
  route: ActivatedRouteSnapshot
) => {
  log('resolving project');
  const apiService = inject(DriplaneService);
  const router = inject(Router);
  const store = inject(Store);
  const urlId = route.paramMap.get('projectId');

  return apiService.getProject(urlId).pipe(
    catchError(() => {
      console.error('project not found');
      router.navigate(['/project-not-found'], { skipLocationChange: true });
      return EMPTY;
    }),
    map((project: Project) => {
      store.dispatch(switchProjectSuccess({ activeProject: project.id }));
      return project;
    })
  );
};
