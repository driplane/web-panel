import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { filter, tap } from 'rxjs/operators';
import { Project } from '../driplane.types';
import { addProjectKey, loadProjectKeys } from '../state/project/project.actions';
import { activeProject, activeProjectKeys } from '../state/project/project.selectors';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {
  activeProject: Project;

  activeProject$ = this.store.pipe(
    select(activeProject),
    filter(p => !!p?.id),
    tap((project) => this.store.dispatch(loadProjectKeys({ project }))),
  );

  activeProjectKeys$ = this.store.pipe(
    select(activeProjectKeys),
  );

  constructor(private store: Store) { }

  addProjectKey() {
    this.store.dispatch(addProjectKey({ project: this.activeProject, projectKey: {
      name: 'Main Key',
      read: false,
      write: true,
      auto_fill: {},
      auto_filter: {},
    }}))
  }

}
