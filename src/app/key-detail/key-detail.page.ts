import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, NavController } from '@ionic/angular';
import { Store, select } from '@ngrx/store';
import { combineLatest, filter, first, map, shareReplay, takeLast, tap } from 'rxjs';
import Logger from '../logger.service';
import { addProjectKey, deleteProjectKey, loadProjectKeys, updateProjectKey } from '../state/project/project.actions';
import { activeProject, activeProjectKeys } from '../state/project/project.selectors';
const log = Logger('page:key-detail');

@Component({
  selector: 'app-key-detail',
  templateUrl: './key-detail.page.html',
  styleUrls: ['./key-detail.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyDetailPage implements OnInit {
  projectKeyForm = new FormGroup({
    key: new FormControl(''),
    name: new FormControl(''),
    read: new FormControl(false),
    write: new FormControl(false),
    auto_fill: new FormControl({}),
    auto_filter: new FormControl({}),
    auto_fill_template: new FormControl({}),
  });

  autoFillForm = new FormGroup({
    valueType: new FormControl('text'),
    key: new FormControl(''),
    value: new FormControl(),
  });

  activeProject$ = this.store.pipe(
    select(activeProject),
    filter(p => !!p?.id),
    tap((project) => this.store.dispatch(loadProjectKeys({ project }))),
  );

  activeProjectKeys$ = this.store.pipe(
    select(activeProjectKeys),
    shareReplay(),
  );

  selectedKey$ = this.activeProjectKeys$.pipe(
    map((keys) => keys.find((key) => key.key === this.route.snapshot.paramMap.get('keyId'))),
    shareReplay(),
  );

  editMode = false;

  constructor(
    private store: Store,
    private actionSheetCtrl: ActionSheetController,
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.activeProject$.subscribe((project) => { });
    if (this.route.snapshot.paramMap.get('keyId')) {
      this.editMode = true;
      // this.projectKeyForm.disable();
      this.ref.markForCheck();
    }

    // Prefill the form
    this.selectedKey$.subscribe((key) => {
      log('selectedKey$', key);
      if (key) {
        this.projectKeyForm.patchValue(key);
      }
    });
  }

  saveProjectKey() {
    log(this.projectKeyForm.value);

    const { key, name, read, write, auto_fill, auto_filter, auto_fill_template } = this.projectKeyForm.value;

    log('saveProjectKey', { name, read, write, auto_fill, auto_filter });
    this.activeProject$.subscribe((project) => {
      if (this.editMode) {
        this.store.dispatch(updateProjectKey({ project, projectKey: { key, name, read, write, auto_fill, auto_filter, auto_fill_template } }))
      } else {
        this.store.dispatch(addProjectKey({ project, projectKey: { name, read, write, auto_fill, auto_filter, auto_fill_template: {} } }))
      }
      this.navCtrl.navigateBack(`/projects/${project.id}/settings`);
    });

  }

  saveAddAutoFill(modal) {
    log(this.autoFillForm.value, this.autoFillForm.status);
    this.autoFillForm.controls.key.markAsTouched();
    this.autoFillForm.controls.value.markAsTouched();

    if (!this.autoFillForm.valid) {
      return;
    }

    const current = this.projectKeyForm.value.auto_fill;
    const currentTemplate = this.projectKeyForm.value.auto_fill_template;
    let newTemplate = {};
    let newAutofill = {};

    if (this.autoFillForm.value.valueType === 'template') {
      newTemplate[this.autoFillForm.value.key] = this.autoFillForm.value.value;
    } else {
      if (this.autoFillForm.value.valueType === 'number') {
        newAutofill[this.autoFillForm.value.key] = ~~(this.autoFillForm.value.value);
      } else {
        newAutofill[this.autoFillForm.value.key] = `${this.autoFillForm.value.value}`;
      }
    }

    log(this.autoFillForm.value);

    this.projectKeyForm.patchValue({
      auto_fill: {
        ...current,
        ...newAutofill,
      },
      auto_fill_template: {
        ...currentTemplate,
        ...newTemplate
      }
    });
    // this.autoFillForm.reset();

    modal.dismiss(this.autoFillForm.value);
  }

  deleteAutoFillKey(key) {
    const current = { ...this.projectKeyForm.value.auto_fill };
    delete current[key];
    this.projectKeyForm.patchValue({
      auto_fill: current,
    });
  }


  deleteAutoFillTemplateKey(key) {
    const current = { ...this.projectKeyForm.value.auto_fill_template };
    delete current[key];
    this.projectKeyForm.patchValue({
      auto_fill_template: current,
    });
  }

  deleteAutoFilterKey(key) {
    const current = this.projectKeyForm.value.auto_filter;
    delete current[key];
    this.projectKeyForm.patchValue({
      auto_filter: current,
    });
  }

  saveAddAutoFilter(modal) {
    log(this.autoFillForm.value, this.autoFillForm.valid);
    this.autoFillForm.markAsTouched();

    if (!this.autoFillForm.valid) {
      return;
    }

    const current = this.projectKeyForm.value.auto_filter;
    if (this.autoFillForm.value.valueType === 'number') {
      this.autoFillForm.value.value = ~~(this.autoFillForm.value.value);
    }

    this.projectKeyForm.patchValue({
      auto_filter: {
        ...current,
        [this.autoFillForm.value.key]: this.autoFillForm.value.value,
      },
    });

    log(this.projectKeyForm.value);
    // this.autoFillForm.reset();

    modal.dismiss(this.autoFillForm.value);
  }

  public actionSheetButtons = [
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
  ];

  confirmDeleteKey() {
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
            combineLatest([
              this.activeProject$,
              this.selectedKey$
            ]).pipe(
              first()
            ).subscribe(([project, projectKey ]) => {
              this.store.dispatch(deleteProjectKey({ project, projectKey }));
              log('confirmDeleteKey onDidDismiss delete', project, projectKey);
              this.navCtrl.navigateBack(`/projects/${project.id}/settings`);

            });
          }
        })
      });
  }
}
