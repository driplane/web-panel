import { Component, ElementRef, ViewChild } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { filter, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Project } from '../driplane.types';
import { addProjectKey, deleteProjectKey, loadProjectKeys } from '../state/project/project.actions';
import { activeDashboard, activeProject, activeProjectKeys } from '../state/project/project.selectors';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import Logger from '../logger.service';
import { ActionSheetController, IonModal, Platform } from '@ionic/angular';
import { DriplaneService } from '../driplane.service';
import { combineLatest, merge } from 'rxjs';
import {
  ItemReorderEventDetail,
  IonItem,
  IonLabel,
  IonList,
  IonReorder,
  IonReorderGroup,
} from '@ionic/angular/standalone';
import { DashboardCard, DashboardGroupCard } from '../state/project/project.reducer';

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
  pointerDevice = false;
  editMode = false;
  dashboardEditMode = false;

  @ViewChild('cardEditor') cardEditor: IonModal;

  cardEditForm = new FormGroup({
    style: new FormControl('chart'),
    sizes: new FormControl(''),
    data: new FormControl([]),
  })

  cardDataForm = new FormGroup({
    event: new FormControl(''),
    title: new FormControl(''),
    filters: new FormControl({}),
    dataLabel: new FormControl(''),
    valueLabel: new FormControl(''),
    unknownLabel: new FormControl(''),
    op: new FormControl<'unique' | 'total' | 'average' | 'min' | 'max' | 'count'>(null),
    tag: new FormControl(),
  })

  activeProject$ = this.store.pipe(
    select(activeProject),
    filter(p => !!p?.id),
    tap((project) => this.store.dispatch(loadProjectKeys({ project }))),
    shareReplay(),
  );

  dashboard$ = this.activeProject$.pipe(
    switchMap(() => this.store.pipe(
      select(activeDashboard),
    )),
    shareReplay(),
  );

  dashboardCards$ = this.dashboard$.pipe(
    map(dashboard => dashboard.cards)
  );

  activeProjectKeys$ = this.store.pipe(
    select(activeProjectKeys),
  );

  projectEvents$ = this.activeProject$.pipe(
    switchMap((project) => this.api.getEventList(project)),
    shareReplay(),
  )

  eventTags$ = combineLatest([this.cardDataForm.controls.event.valueChanges, this.projectEvents$]).pipe(
    tap(([selectedEvent, events]) => console.log(selectedEvent)),
    map(([selectedEvent, events]) => events.find((eventData) => eventData.name === selectedEvent)?.schema)
  );

  constructor(private store: Store, private api: DriplaneService, private actionSheetCtrl: ActionSheetController, private platform: Platform) {
    if (matchMedia('(pointer:fine)').matches) {
      this.pointerDevice = true;
    }
  }

  orderDashboardCards(event: CustomEvent<ItemReorderEventDetail>) {
    // The `from` and `to` properties contain the index of the item
    // when the drag started and ended, respectively
    console.log('Dragged from index', event.detail.from, 'to', event.detail.to);

    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. This method can also be called directly
    // by the reorder group
    event.detail.complete();
  }

  showCardEditor(card) {
    this.cardEditForm.patchValue(card);
    this.cardEditor.present();
  }

  confirmDeleteCard(card: DashboardGroupCard) {
    this.actionSheetCtrl
      .create({
        header: 'Are you sure you want to delete this card?',
        buttons: [
          {
            text: 'Delete',
            role: 'destructive',
            data: {
              action: 'delete',
              card,
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
          if (result.role === 'destructive') {
            // this.store.dispatch(deleteDashboardCard({ card }));
          }
        })
      });
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

  saveCard(modal: IonModal) {
    modal.dismiss();
  }
}
