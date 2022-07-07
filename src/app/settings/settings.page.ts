import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { activeProject } from '../project.selectors';
import { distinctUntilKeyChanged, shareReplay, startWith, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { loadProjectKeys } from '../project.actions';
import { pipe, Subject } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit, OnDestroy {
  destroyed$ = new Subject<boolean>();

  activeProject$ = this.store.pipe(
    select(activeProject),
    takeUntil(this.destroyed$),
    shareReplay(1),
  );

  constructor(private store: Store) { }

  ngOnInit() {
    let a = false;
    this.activeProject$.pipe(
      // takeWhile(p => !!p?.id),
      // distinctUntilKeyChanged('id')
    ).subscribe((project) => {
      console.log('Load project keys');
      // FIXME:
      if (project?.id && !a) {
        a = true;
        this.store.dispatch(loadProjectKeys({ project }));
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
