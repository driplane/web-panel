import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SidemenuPage } from './sidemenu.page';

const routes: Routes = [{
  path: '',
  component: SidemenuPage,
  children: [
  {
    path: 'projects/:projectId',
    loadChildren: () => import('../project/project.module').then( m => m.ProjectPageModule)
  },
  {
    path: 'projects/:projectId/settings',
    loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule)
  },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SidemenuPageRoutingModule { }
