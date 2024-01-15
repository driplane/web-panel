import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalViewComponent } from './modal-view/modal-view.component';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [ModalViewComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [ModalViewComponent]
})
export class AppCommonModule { }
