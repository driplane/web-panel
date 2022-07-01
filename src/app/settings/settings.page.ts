import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { activeProject } from '../project.selectors';
import { shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  activeProject$ = this.store.pipe(
    select(activeProject),
    shareReplay(1),
  );

  constructor(private store: Store) { }

  ngOnInit() {
  }

}
