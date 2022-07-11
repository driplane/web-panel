import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-timeline-chart-row',
  templateUrl: './timeline-chart-row.component.html',
  styleUrls: ['./timeline-chart-row.component.scss'],
})
export class TimelineChartRowComponent implements OnInit {
  @Input() label = '';
  @Input() unit: 'number' | 'filesize' | 'percent' = 'number';

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public lineChartType: ChartType = 'line';

  public lineChartData: ChartConfiguration<'line'>['data'];

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false
  };

  chartResults = [];

  totalNumber: number;

  yScaleMin: number;
  yScaleMax: number;

  constructor() {}

  @Input()
  set chartData(data: { name: string; value: number }[]) {
    if (!data) {
      return;
    }
    this.lineChartData = {
      labels: data.map((item) => item.name),
      datasets: [
        {
          data: data.map((item) => item.value),
          // label: 'Series A',
          fill: true,
          tension: 0.5,
          borderColor: 'rgba(148,159,177,1)',
          backgroundColor: 'rgba(148,159,177,0.2)',
        },
      ],
    };

    this.chartResults = data.map((item) => ({
      ...item,
      group: this.label,
    }));

    this.totalNumber = data.reduce((acc, item) => item.value + acc, 0);
    if (this.unit === 'percent') {
      this.totalNumber = this.totalNumber / data.length;
      this.yScaleMax = 100;
    }
  }

  ngOnInit() {}
}
