import { Component } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { Store, select } from '@ngrx/store';
import { filter } from 'rxjs';
import Logger from '../logger.service';
import { addProject, deleteProject } from '../state/project/project.actions';
import { projects } from '../state/project/project.selectors';
const log = Logger('page:account');

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage {

  projects$ = this.store.pipe(
    select(projects),
    filter((projects) => projects !== null),
  );

  constructor(
    private store: Store
  ) { }

  message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
  name: string;

  cancel(modal: IonModal) {
    modal.dismiss(null, 'cancel');
  }

  confirm(modal: IonModal) {
    modal.dismiss(this.name, 'confirm');
  }

  confirmDelete(modal: IonModal, projectId: string) {
    modal.dismiss(projectId, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      log(ev.detail);

      this.store.dispatch(addProject({ project: { name: ev.detail.data } }));
    }
  }

  onWillDismissDelete(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      log(ev.detail);

      this.store.dispatch(deleteProject({ projectId: ev.detail.data }));
    }
  }

}
