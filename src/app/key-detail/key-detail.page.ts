import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { activeProject, activeProjectKeys } from '../state/project/project.selectors';
import { filter, map, shareReplay, tap } from 'rxjs';
import { addProjectKey, loadProjectKeys } from '../state/project/project.actions';
import Logger from '../logger.service';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
const log = Logger('page:key-detail');

@Component({
  selector: 'app-key-detail',
  templateUrl: './key-detail.page.html',
  styleUrls: ['./key-detail.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyDetailPage implements OnInit {
  projectKeyForm = new FormGroup({
    name: new FormControl(''),
    read: new FormControl(false),
    write: new FormControl(false),
    auto_fill: new FormControl({}),
    auto_filter: new FormControl({}),
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
  );

  selectedKey$ = this.activeProjectKeys$.pipe(
    map((keys) => keys.find((key) => key.key === this.route.snapshot.paramMap.get('keyId'))),
    shareReplay(),
  );

  editMode = false;

  constructor(private store: Store, private route: ActivatedRoute, private router: Router, private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.activeProject$.subscribe((project) => {});
    if (this.route.snapshot.paramMap.get('keyId')) {
      this.editMode = true;
      this.ref.markForCheck();
    }

    log('KeyDetailPage ngOnInit()');

    this.selectedKey$.subscribe((key) => {
      log('KeyDetailPage ngOnInit() selectedKey$', key);

      if (key) {
        this.projectKeyForm.patchValue(key);
      }
    })
  }

  saveProjectKey() {
    log(this.projectKeyForm.value);

    const { name, read, write, auto_fill, auto_filter } = this.projectKeyForm.value;

    this.activeProject$.subscribe((project) => {
      this.store.dispatch(addProjectKey({ project, projectKey: { name, read, write, auto_fill, auto_filter }}))
    });

    this.router.navigate(['../..'], { relativeTo: this.route });
  }

  saveAddAutoFill(modal) {
    log(this.autoFillForm.value, this.autoFillForm.status);
    this.autoFillForm.controls.key.markAsTouched();
    this.autoFillForm.controls.value.markAsTouched();

    if (!this.autoFillForm.valid) {
      return;
    }

    const current = this.projectKeyForm.value.auto_fill;
    if (this.autoFillForm.value.valueType === 'number') {
      this.autoFillForm.value.value = ~~(this.autoFillForm.value.value);
    }

    log(this.autoFillForm.value);

    this.projectKeyForm.patchValue({
      auto_fill: {
        ...current,
        [this.autoFillForm.value.key]: this.autoFillForm.value.value,
      },
    });
    this.autoFillForm.reset();

    modal.dismiss(this.autoFillForm.value);
  }

  deleteAutoFillKey(key) {
    const current = this.projectKeyForm.value.auto_fill;
    delete current[key];
    this.projectKeyForm.patchValue({
      auto_fill: current,
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
    this.autoFillForm.reset();

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

  }
}
