import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { activeProject, activeProjectKeys } from '../project.selectors';
import { distinctUntilKeyChanged, filter, shareReplay, startWith, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { addProjectKey, loadProjectKeys } from '../project.actions';
import { pipe, Subject } from 'rxjs';
import { Project } from '../driplane.types';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit, OnDestroy {
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

  ngOnInit() {
    // this.store.dispatch(loadProjectKeys({ project }));
    let a = false;
    // this.activeProject$.pipe(
    //   // takeWhile(p => !!p?.id),
    //   // distinctUntilKeyChanged('id')
    // ).subscribe((project) => {
    //   this.activeProject = project;
    //   console.log('Load project keys');

    //   if (project?.id) {
    //     this.store.dispatch(loadProjectKeys({ project }));
    //   }
    // });
  }

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
