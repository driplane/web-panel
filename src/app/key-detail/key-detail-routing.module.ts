import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { KeyDetailPage } from './key-detail.page';

const routes: Routes = [
  {
    path: '',
    component: KeyDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KeyDetailPageRoutingModule {}
