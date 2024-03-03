import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { KeyDetailPageRoutingModule } from './key-detail-routing.module';

import { KeyDetailPage } from './key-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    KeyDetailPageRoutingModule
  ],
  declarations: [KeyDetailPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class KeyDetailPageModule {}
