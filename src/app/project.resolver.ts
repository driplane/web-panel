import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  Router
} from '@angular/router';
import { Store, select } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { Project } from './driplane.types';
import Logger from './logger.service';
import { loadProjects, switchProjectSuccess } from './state/project/project.actions';
import { projects } from './state/project/project.selectors';
const log = Logger('resolver:projectId');

export const ProjectIdResolverService: ResolveFn<Project> = (
  route: ActivatedRouteSnapshot
) => {
  log('resolving project');
  const router = inject(Router);
  const store = inject(Store);
  const urlId = route.paramMap.get('projectId');

  store.dispatch(loadProjects());

  return store.pipe(
    select(projects),
    filter((projects) => projects !== null),
    map((projects) => {
      log(urlId, projects);
      const project = projects.find((p) => p.id === urlId);
      if (project) {
        store.dispatch(switchProjectSuccess({ activeProject: project.id }));
        return project;
      }

      throw Error("projcet not found");
    }),
    catchError(() => {
      console.error('project not found');
      router.navigate(['/project-not-found'], { skipLocationChange: true });
      return EMPTY;
    })
  );
};
