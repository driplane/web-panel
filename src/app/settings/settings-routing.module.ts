import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

import { SettingsPage } from './settings.page';

const routes: Routes = [
  {
    path: '',
    component: SettingsPage
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CodemirrorModule,
  ],
  exports: [RouterModule],
})
export class SettingsPageRoutingModule {}
