import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { catchError, filter, map, of, switchMap } from 'rxjs';
import Logger from './logger.service';
import { loadProjects, switchProject } from './state/project/project.actions';
import { projects } from './state/project/project.selectors';
const log = Logger('guard:defaultProject');

export const LAST_PROJECT_ID = 'lastProjectId';

export const defaultProjectGuard: CanActivateFn = () => {
  log('here');
  const router: Router = inject(Router);
  const store = inject(Store)

  const notFound = router.createUrlTree(['/project-not-found/']);

  store.dispatch(loadProjects());

  return store.pipe(
    select(projects),
    filter((projects) => projects !== null),
    switchMap((projects) => {
      log('projects', projects);

      const lastProjectId = localStorage.getItem(LAST_PROJECT_ID);

      if (projects.find((project) => project.id === lastProjectId)) {
        return of(projects.find((project) => project.id === lastProjectId));
      }

      return of(projects[0]);
    }),
    map((project) => {
      log('navigating to', project);
      store.dispatch(switchProject({ activeProject: project.id }));
      return false;
    }),
    catchError(() => of(notFound))
  );
};
