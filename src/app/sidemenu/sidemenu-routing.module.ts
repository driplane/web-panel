import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectIdResolverService } from '../project.resolver';

import { SidemenuPage } from './sidemenu.page';
import { defaultProjectGuard } from '../default-project.guard';

const routes: Routes = [
  {
    path: '',
    component: SidemenuPage,
    children: [
      {
        path: '',
        redirectTo: 'projects/auto',
        pathMatch: 'full',
      },
      {
        path: 'projects',
        pathMatch: 'full',
        redirectTo: 'projects/auto',
      },
      {
        path: 'project-not-found',
        pathMatch: 'full',
        loadChildren: () =>
          import('../not-found/not-found.module').then(
            (m) => m.NotFoundPageModule
          ),
      },
      {
        path: 'projects',
        children: [
          {
            path: 'auto',
            pathMatch: 'full',
            canActivate: [defaultProjectGuard],
            loadChildren: () =>
              import('../project/project.module').then(
                (m) => m.ProjectPageModule
              ),
          },
          {
            path: ':projectId',
            resolve: {
              project: ProjectIdResolverService,
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
                children: [
                  {
                    path: '',
                    loadChildren: () =>
                      import('../settings/settings.module').then(
                        (m) => m.SettingsPageModule
                      ),
                    pathMatch: 'full',
                  },
                  {
                    path: 'keys/new',
                    loadChildren: () => import('../key-detail/key-detail.module').then( m => m.KeyDetailPageModule)
                  },{
                    path: 'keys/:keyId',
                    loadChildren: () => import('../key-detail/key-detail.module').then( m => m.KeyDetailPageModule)
                  },
                ]
              },
            ],
          },
        ],
      },
      {
        path: 'account',
        loadChildren: () => import('../account/account.module').then( m => m.AccountPageModule)
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SidemenuPageRoutingModule {}
