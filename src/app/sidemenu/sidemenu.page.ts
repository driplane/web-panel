import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil } from 'rxjs/operators';
import { signOut } from '../auth.actions';
import { isLoggedIn } from '../auth.selectors';
import Logger from '../logger.service';
import { loadProjects, switchProject } from '../project.actions';
import { activeProjectId, projects } from '../project.selectors';
const log = Logger('page:sidemenu');

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.page.html',
  styleUrls: ['./sidemenu.page.scss'],
})
export class SidemenuPage implements OnInit, OnDestroy {
  activeProject$ = this.store.pipe(
    select(activeProjectId),
    shareReplay(1),
  );

  projects$ = this.store.pipe(
    select(projects),
    filter((projects) => projects !== null),
    shareReplay(1),
  );

  hasMultipleProjects$ = this.projects$.pipe(
    map((projects) => projects.length > 1)
  )

  unsubscribe: Subject<void> = new Subject();

  isLoggedIn$ = this.store.pipe(
    select(isLoggedIn),
    takeUntil(this.unsubscribe)
  );

  constructor(
    private router: Router,
    private store: Store,
  ) {
  }

  ngOnInit() {
    log('init');
    this.isLoggedIn$.subscribe((loggedIn) => {
      if (loggedIn) {
        this.store.dispatch(loadProjects());
      }
    });

    let activeProjectSelected = false;

    this.activeProject$.subscribe((currentProject) => {
      if (currentProject) {
        activeProjectSelected = true;
      }
    });
  }

  signOut() {
    this.store.dispatch(signOut());
  }

  compareWith(o1, o2) {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  switchProject(event) {
    this.store.dispatch(switchProject({activeProject: event.target.value}));
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
   }
}
