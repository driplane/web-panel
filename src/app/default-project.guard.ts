import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { catchError, filter, map, of, switchMap } from 'rxjs';
import Logger from './logger.service';
import { loadProjects } from './state/project/project.actions';
import { projects } from './state/project/project.selectors';
const log = Logger('guard:defaultProject');

export const defaultProjectGuard: CanActivateFn = () => {
  log('here');
  const router: Router = inject(Router);
  const store = inject(Store)

  const lastProjectId = localStorage.getItem('lastProjectId');
  const notFound = router.createUrlTree(['/project-not-found/']);

  store.dispatch(loadProjects());

  return store.pipe(
    select(projects),
    filter((projects) => projects !== null),
    switchMap((projects) => {
      log('projects', projects);

      if (projects.find((project) => project.id === lastProjectId)) {
        return of(projects.find((project) => project.id === lastProjectId));
      }

      return of(projects[0]);
    }),
    map((project) => {
      log('navigating to', project);
      router.navigate(['/projects', project.id], { replaceUrl: true });
      return false;
    }),
    catchError(() => of(notFound))
  );
};
