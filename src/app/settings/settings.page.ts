import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { filter, tap } from 'rxjs/operators';
import { Project } from '../driplane.types';
import { addProjectKey, loadProjectKeys } from '../state/project/project.actions';
import { activeProject, activeProjectKeys } from '../state/project/project.selectors';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import Logger from '../logger.service';
const log = Logger('page:settings');

interface AutoFill {
  [key: string]: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {
  projectKeyCreateForm = new FormGroup({
    name: new FormControl(''),
    read: new FormControl(false),
    write: new FormControl(false),
    auto_fill: new FormArray([]),
    auto_filter: new FormArray([]),
  });

  activeProject$ = this.store.pipe(
    select(activeProject),
    filter(p => !!p?.id),
    tap((project) => this.store.dispatch(loadProjectKeys({ project }))),
  );

  activeProjectKeys$ = this.store.pipe(
    select(activeProjectKeys),
  );

  constructor(private store: Store) { }

  createProjectKey() {
    log(this.projectKeyCreateForm.value);
    return;

    this.activeProject$.subscribe((project) => {
      this.store.dispatch(addProjectKey({ project, projectKey: {
        name: 'Main Key',
        read: false,
        write: true,
        auto_fill: {},
        auto_filter: {},
      }}))
    });
  }
}
