import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DriplaneService } from './driplane.service';
import { catchError, map, of, switchMap } from 'rxjs';
import { addProject } from './project.actions';
import Logger from './logger.service';
const log = Logger('guard:defaultProject');

export const defaultProjectGuard: CanActivateFn = () => {
  log('here');
  const driplaneService: DriplaneService = inject(DriplaneService);
  const router: Router = inject(Router);

  const lastProjectId = localStorage.getItem('lastProjectId');
  const notFound = router.createUrlTree(['/project-not-found/']);

  return driplaneService.getProjects().pipe(
    switchMap((projects) => {
      log('projects', projects);
      if (projects.length === 0) {
        log('No projects found. Creating default project...');
        addProject({ project: { name: 'Default Project' } });
        return driplaneService.createProject({ name: 'Default Project' });
      }

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
