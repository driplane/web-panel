import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { IonicModule } from '@ionic/angular';

import { ProjectPageRoutingModule } from './project-routing.module';

import { LineChartComponent } from '../line-chart/line-chart.component';
import { ProjectPage } from './project.page';
import { DetailModalComponent } from '../detail-modal/detail-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ProjectPageRoutingModule,
    ScrollingModule,
  ],
  declarations: [ProjectPage, LineChartComponent, DetailModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProjectPageModule {}
