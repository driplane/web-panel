import { Component, ElementRef } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { filter, tap } from 'rxjs/operators';
import { Project } from '../driplane.types';
import { addProjectKey, deleteProjectKey, loadProjectKeys } from '../state/project/project.actions';
import { activeProject, activeProjectKeys } from '../state/project/project.selectors';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import Logger from '../logger.service';
import { ActionSheetController, Platform } from '@ionic/angular';
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
  activeProject$ = this.store.pipe(
    select(activeProject),
    filter(p => !!p?.id),
    tap((project) => this.store.dispatch(loadProjectKeys({ project }))),
  );

  activeProjectKeys$ = this.store.pipe(
    select(activeProjectKeys),
  );

  pointerDevice = false;
  editMode = false;

  constructor(private store: Store, private actionSheetCtrl: ActionSheetController, private platform: Platform) {
    if (matchMedia('(pointer:fine)').matches) {
      this.pointerDevice = true;
    }
  }

  confirmDeleteKey(projectKey) {
    log('confirmDeleteKey');

    this.actionSheetCtrl
      .create({
        header: 'Are you sure you want to delete this key?',
        buttons: [
          {
            text: 'Delete',
            role: 'destructive',
            data: {
              action: 'delete',
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
            data: {
              action: 'cancel',
            },
          },
        ],
      })
      .then((actionSheet) => {
        actionSheet.present();
        actionSheet.onDidDismiss().then((result) => {
          log('confirmDeleteKey onDidDismiss', result);
          if (result.role === 'destructive') {
            log('confirmDeleteKey onDidDismiss delete');
            this.activeProject$.subscribe((project) => {
              this.store.dispatch(deleteProjectKey({ project, projectKey }));
              log('confirmDeleteKey onDidDismiss delete', project, projectKey);
            });
          }
        })
      });
  }
}
