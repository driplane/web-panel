import { Component, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, shareReplay, takeUntil, tap } from 'rxjs/operators';
import { Project } from '../driplane.types';
import { addProjectKey, loadProjectKeys } from '../project.actions';
import { activeProject, activeProjectKeys } from '../project.selectors';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnDestroy {
  destroyed$ = new Subject<boolean>();

  activeProject: Project;

  activeProject$ = this.store.pipe(
    select(activeProject),
    takeUntil(this.destroyed$),
    shareReplay(1),
    filter(p => !!p?.id),
    tap((project) => this.store.dispatch(loadProjectKeys({ project }))),
  );

  activeProjectKeys$ = this.store.pipe(
    select(activeProjectKeys),
    takeUntil(this.destroyed$),
    shareReplay(1),
  );

  constructor(private store: Store) { }

  addProjectKey() {
    this.store.dispatch(addProjectKey({ project: this.activeProject, projectKey: {
      name: 'Main',
      read: true,
      write: true,
      auto_fill: {}
    }}))
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
