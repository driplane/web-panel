import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProjectPageRoutingModule } from './project-routing.module';

import { LineChartComponent } from '../line-chart/line-chart.component';
import { ProjectPage } from './project.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ProjectPageRoutingModule,
  ],
  declarations: [ProjectPage, LineChartComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProjectPageModule {}
