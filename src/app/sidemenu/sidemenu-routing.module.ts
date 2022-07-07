import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectIdResolverService } from '../project.resolver';

import { SidemenuPage } from './sidemenu.page';

const routes: Routes = [
  {
    path: '',
    component: SidemenuPage,
    children: [
      {
        path: 'projects/:projectId',
        resolve: {
          project: ProjectIdResolverService
        },
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../project/project.module').then(
                (m) => m.ProjectPageModule
              ),
          },
          {
            path: 'settings',
            title: 'Settings',
            loadChildren: () =>
              import('../settings/settings.module').then(
                (m) => m.SettingsPageModule
              ),
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SidemenuPageRoutingModule {}
